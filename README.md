# chatpack-expo

React Native / Expo transport adapter for [`@chatpack/client`](https://github.com/chddaniel/chatpack). Same hooks, same REST API — this package only replaces the parts that assume a browser: the `EventSource`, the auth model, and the tab-visibility lifecycle.

It does not fork or reimplement Chatpack's domain logic. Your backend (`@chatpack/core` + an adapter) is unchanged.

## Install

```sh
npm install chatpack-expo @chatpack/client react-native
```

`react-native` (or Expo, which includes it) is a peer dependency — this package assumes it's the host runtime.

## What this solves, and how

| Browser assumption in `@chatpack/client` | RN reality | Fix here |
| --- | --- | --- |
| `new EventSource(url)` global | Doesn't exist in RN | `XhrEventSource` — an SSE client built on `XMLHttpRequest`'s `onreadystatechange`/`responseText` growth, the only incremental-delivery primitive RN gives you without a native module. Vendored from `react-native-sse`'s approach (not depended on — that package is unmaintained since 2024), rewritten in TS, and unit-tested against the exact chunk-boundary and reconnect logic Chatpack's gap-fill (`Last-Event-ID`) depends on. |
| `window.location.origin` fallback for a relative `baseURL` | No `window` | `baseURL` is **required**, not optional, on `ExpoChatClientOptions` |
| `credentials: "include"` + a browser cookie jar | RN has no implicit cookie jar | `getAuthHeaders()` — sync or async, re-invoked on every request and every reconnect, feeds both REST headers and the SSE connection (which has no headers channel of its own in Chatpack's `EventSourceFactory` contract — that's why this exists as a separate option instead of just reusing `headers`) |
| `document.visibilitychange` pausing polling in a hidden tab | No `document`; nothing tells Chatpack the app backgrounded | `attachAppStateRealtimeLifecycle()` — wires RN's `AppState` to `client.realtime.connect()` / `.disconnect()` |

## Usage

```ts
// lib/chat.ts
import { createExpoChatClient } from "chatpack-expo/react";
import * as SecureStore from "expo-secure-store";

export const chat = createExpoChatClient({
  baseURL: "https://api.yourapp.com",
  getAuthHeaders: async () => {
    const token = await SecureStore.getItemAsync("session_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

```tsx
// App.tsx
import { useEffect } from "react";
import { attachAppStateRealtimeLifecycle } from "chatpack-expo";
import { useConversations, useMessages } from "chatpack-expo/react";
import { chat } from "./lib/chat";

export default function App() {
  useEffect(() => attachAppStateRealtimeLifecycle(chat.realtime), []);

  const { data: conversations } = useConversations(chat);
  // ...
}
```

Every hook (`useConversations`, `useMessages`, `useConversation`, `useMessageSearch`, `usePresence`, `useReceipts`, `useRealtimeStatus`, `useTyping`) is re-exported from `chatpack-expo/react` unchanged — they don't know or care that the transport underneath is XHR instead of a real `EventSource`.

The non-React entry (`chatpack-expo`, no `/react`) gives you `createExpoChatClient` returning the plain imperative client — for calling from outside a component tree — plus `attachAppStateRealtimeLifecycle`.

## What this package does *not* solve

**Push notifications for a backgrounded or killed app.** SSE and the polling fallback both require the JS runtime to be alive; iOS suspends it shortly after backgrounding. There's no way around this from the client side — it needs APNs/FCM.

Chatpack's server-side `hooks.afterMessageSend` (fires after every durable write) is the intended extension point:

```ts
// on your backend
const chat = chatpack({
  storage, auth,
  hooks: {
    afterMessageSend: async (ctx) => {
      await enqueuePush(ctx.conversationId, ctx.message); // your own job queue
    },
  },
});
```

Chatpack's own docs are explicit that this hook has **no retries and no delivery guarantee** — it's awaited, and a throw is logged and swallowed so the sender never sees an error for a side effect. Don't call your push provider directly inside it; enqueue into something that retries. A dropped push with no queue behind it just looks like "the app never notified me," with nothing to tell you it happened.

**Battery/data cost of polling while foregrounded on a platform without a real stream.** `attachAppStateRealtimeLifecycle` stops the waste in the background, but if `mode: "auto"` has fallen back to 5s polling in the foreground (no working `eventSource`), that's still 5s polling. Verify the SSE path is actually connecting (`useRealtimeStatus`) rather than assuming it is.

## Known limitations of the vendored SSE client

- Re-parses the whole buffered `responseText` on every chunk (`O(n)` per tick against everything received so far), not just the new bytes. Irrelevant for Chatpack's small JSON message events; would be a real cost for a high-volume single stream (e.g. token-by-token LLM output). Swap the transport if you need that — the `EventSourceFactory` seam is the same one Chatpack's own web client uses.
- No support for the SSE `retry:` field's reconnect-delay override — reconnect delay is a fixed local policy (`reconnectIntervalMs`, default 1000ms) instead. Chatpack doesn't send `retry:`, so this hasn't mattered in practice.
- `removeEventListener` is a documented no-op once the underlying connection exists for listeners registered while the auth-header fetch was still pending (identity can't round-trip through the buffering wrapper). Chatpack's own client never calls it — `disconnect()` always goes through `close()` — so this hasn't been a problem in testing, but it's a sharp edge if you use the `EventSourceFactory` output directly.

## Status

Unpublished. Verified end-to-end against a live Chatpack backend (`@chatpack/core` + `adapter-memory`) running in a real Expo/RN runtime (iOS Simulator, Expo Go): REST, SSE realtime, auth-header wiring on both the REST and SSE channels, and the AppState connect/disconnect/reconnect lifecycle all confirmed working. The SSE parsing/reconnect/Last-Event-ID logic also has unit test coverage (`npm test`).
