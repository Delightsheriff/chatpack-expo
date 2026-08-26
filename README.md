# chatpack-expo-ui

shadcn/ui-inspired chat components for React Native/Expo, built on top of
[`chatpack-expo`](https://github.com/chddaniel/chatpack) and
`@chatpack/client`'s hooks. Ports shadcn's chat primitives (`MessageScroller`,
`Message`, `Bubble`, `Attachment`, `Marker`) to native RN views, and uses
`@expo/ui`'s native `BottomSheet` for message actions/reactions so those
interactions render as a real native sheet on iOS and Android — not a JS
modal styled to look like one.

This package does not reimplement any of Chatpack's domain logic — it only
renders whatever `useMessages`/`useConversations`/etc. (re-exported from
`chatpack-expo/react`) already give you.

## Install

```sh
npm install chatpack-expo-ui chatpack-expo @chatpack/client @expo/ui @shopify/flash-list expo-image react-native-reanimated react-native-worklets
```

`@expo/ui` requires Expo SDK 57+ (it renders true native SwiftUI/Jetpack
Compose views, not JS-rendered RN views) — this package targets Expo apps
specifically, unlike `chatpack-expo` itself which also works in bare RN.

## What's here, and why it's shaped this way

| shadcn component | This package | Notes |
| --- | --- | --- |
| `MessageScroller` | `MessageScroller` | `@shopify/flash-list`-backed, inverted, newest-at-bottom. Takes an `ItemComponent` reference (not an inline `renderItem` closure) so FlashList never treats a re-render as a new item type. |
| `Message` | `Message` (compound: `Message.Bubble`, `Message.Attachment`) | Row root computing ownership (`isOwn`) and grouping once, provided via context — `useMessageContext()` is exported if you want to build a fully custom row on the same primitives. |
| `Bubble` | `Message.Bubble` | Explicit `variant` (`"sent" \| "received" \| "system"`), not a stack of booleans. Renders `message.reactions` inline; tapping a reaction chip calls `onReact` again (toggle semantics are your app's call). |
| `Attachment` | `Message.Attachment` | Chatpack's core has no media pipeline — this reads a `{ attachments: ChatAttachment[] }` convention out of `message.metadata` via `attachmentsFromMetadata()`. Bring your own upload flow; this only renders. |
| `Marker` | `Marker` | `variant="date"` for day separators, `"system"` for plain notices, `"streaming"` for a shimmering live-status label (`ShimmerText`, opacity-only animation). |
| — | `Composer` | Not in shadcn's set — a minimal text input + send button, since a running chat screen needs one. Owns none of keyboard-avoidance/safe-area/attachment-picking; wrap it yourself. |
| — | `MessageActionsSheet` | Long-press actions (reply/copy/delete) + quick reactions, in a native `@expo/ui` `BottomSheet`. Renders nothing if you haven't wired any `ChatUIActions` handler. |

## Usage

```tsx
import { memo } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useConversation, useMessages } from "chatpack-expo/react";
import {
  ChatUIProvider,
  MessageScroller,
  Message,
  Marker,
  Composer,
  MessageActionsSheet,
  isDifferentCalendarDay,
  formatDateMarker,
  type MessageItemProps,
} from "chatpack-expo-ui";
import { chat } from "./lib/chat";

const MessageRow = memo(function MessageRow({ message, previousMessage, nextMessage }: MessageItemProps) {
  return (
    <>
      {isDifferentCalendarDay(previousMessage, message) && (
        <Marker variant="date" label={formatDateMarker(new Date(message.createdAt))} />
      )}
      <Message message={message} previousMessage={previousMessage} nextMessage={nextMessage}>
        <Message.Bubble />
      </Message>
    </>
  );
});

export function ConversationScreen({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const { data: messages, send } = useMessages(chat, conversationId);

  return (
    <ChatUIProvider currentUserId={currentUserId} onReply={(id) => console.log("reply to", id)}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", default: undefined })}>
        <MessageScroller messages={messages ?? []} ItemComponent={MessageRow} />
        <Composer onSend={(body) => send({ conversationId, body })} />
      </KeyboardAvoidingView>
    </ChatUIProvider>
  );
}
```

`useMessages`'s exact return shape — is it `{ data, send }` or something else —
depends on `@chatpack/client`'s actual hook signature; check
`chatpack-expo/react`'s re-exports before copying this verbatim.

## Everything here is meant to be edited, not just configured

Every visual component takes a `style` override that **merges** with (never
replaces) its computed styles. Theming goes through `ChatUIProvider`'s
`theme` prop (`ChatTheme` — see `src/theme/tokens.ts`), not hidden constants.
Context hooks (`useChatUI`, `useMessageContext`) are exported specifically so
you can build a replacement for any one piece — a different `Bubble`, a
custom attachment renderer — on the same state instead of forking the whole
package. If you find yourself passing a prop *around* a limitation instead of
just changing the component, that's a sign to fork the file into your app
instead of fighting the package's shape.

## Status

Built and typechecked against `@chatpack/client`, `@expo/ui@57`,
`@shopify/flash-list@2`, on React Native 0.86 / React 19.2 (the versions
Expo SDK 57's own `create-expo-app` installs). Grouping/date-marker logic has
unit test coverage (`npm test`). **Not yet run in a real Expo app** — unlike
`chatpack-expo`'s transport layer, these components haven't been exercised
in the iOS Simulator yet. That's the next step before either package is
published.
