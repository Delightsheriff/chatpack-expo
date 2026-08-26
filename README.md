# chatpack-expo-ui

shadcn/ui-inspired chat components for React Native/Expo, built on top of
[`chatpack-expo`](https://github.com/chddaniel/chatpack) and
`@chatpack/client`'s hooks. Ports shadcn's chat primitives (`MessageScroller`,
`Message`, `Bubble`, `Attachment`, `Marker`) to native RN views, uses
`@expo/ui`'s native `BottomSheet` for message actions/reactions so those
render as a real native sheet on iOS and Android, and covers the rest of
[checklist.design's mobile chat checklist](https://www.checklist.design/mobile/chat)
— swipe-to-reply, hold-to-react, read receipts, typing indicator, scroll-to-
latest, and cross-platform keyboard push-up.

This package does not reimplement any of Chatpack's domain logic — it only
renders whatever `useMessages`/`useConversations`/`useTyping`/`useReceipts`
(re-exported from `chatpack-expo/react`) already give you.

## Install

```sh
npm install chatpack-expo-ui chatpack-expo @chatpack/client @expo/ui @shopify/flash-list expo-image react-native-reanimated react-native-worklets react-native-gesture-handler
```

`@expo/ui` requires Expo SDK 57+ (it renders true native SwiftUI/Jetpack
Compose views, not JS-rendered RN views) — this package targets Expo apps
specifically, unlike `chatpack-expo` itself which also works in bare RN.

Wrap your app root in `GestureHandlerRootView` (from
`react-native-gesture-handler`) — required for `SwipeToReply`.

### Optional: NativeWind / Tailwind

Every component accepts a `className` prop alongside `style` — Tailwind is
the first-class second styling option here, but nothing in this package
imports `nativewind` unconditionally, so it works with zero setup if you
just use `style`/`ChatUIProvider`'s `theme` prop instead. To use `className`:

```sh
npm install nativewind tailwindcss
```

and enable NativeWind's babel/metro transform per
[NativeWind's own setup guide](https://www.nativewind.dev/quick-starts/expo) —
once that's active, `className` on `View`/`Text`/`Pressable`/etc. works
anywhere in your tree, including inside this package's components, with no
extra step from you. `MessageScroller`'s `className` (on the underlying
`FlashList`, a third-party component NativeWind doesn't auto-patch) is
wired up via `cssInterop` automatically — still nothing you need to
configure, it's a no-op if `nativewind` isn't installed.

Other styling systems (Tamagui, Unistyles, plain `StyleSheet`) work the same
way: use `style` and `ChatUIProvider`'s theme tokens; `className` is
additive, not a replacement for `style`.

## What's here, and why it's shaped this way

| shadcn / checklist item | This package | Notes |
| --- | --- | --- |
| `MessageScroller` | `MessageScroller` | `@shopify/flash-list`-backed, inverted, newest-at-bottom. Takes an `ItemComponent` reference (not an inline `renderItem` closure). Also owns scroll-to-latest (see below) — the one piece of behavior that needs the list's own scroll offset. |
| `Message` | `Message` (compound: `Message.Bubble`, `Message.Attachment`, `Message.QuickReactions`) | Row root computing ownership (`isOwn`) and grouping once, provided via context — `useMessageContext()` is exported if you want to build a fully custom row on the same primitives. |
| `Bubble` | `Message.Bubble` | Explicit `variant` (`"sent" \| "received" \| "system"`), not a stack of booleans. Renders `message.reactions` inline. |
| `Attachment` | `Message.Attachment` | Chatpack's core has no media pipeline — reads a `{ attachments: ChatAttachment[] }` convention out of `message.metadata` via `attachmentsFromMetadata()`. Bring your own upload flow; this only renders. |
| `Marker` | `Marker` | `variant="date"` / `"system"` / `"streaming"` (shimmering live-status label). |
| — | `Composer` | Text input + send button. Owns none of keyboard-avoidance/safe-area/attachment-picking — wrap it in `ChatKeyboardView`, pass a picker trigger via `leadingAccessory`. |
| Long-press actions + reaction picker | `MessageActionsSheet` | Native `@expo/ui` `BottomSheet`. Default action list (reply/copy/delete) comes from `buildDefaultMessageActions()`, but `actions` fully overrides it — **arbitrary custom actions** (forward, report, pin, whatever your app needs), not a fixed set. |
| Swipe to reply | `SwipeToReply` | Wraps a `<Message>` row; `Gesture.Pan` (not `PanResponder`) driving a `transform`-only animation. Standalone wrapper, not baked into `Message`/`Bubble` — a row that doesn't want it just isn't wrapped. |
| Hold to react | `Message.QuickReactions` / `QuickReactionBar` | A lighter-weight alternative (or addition) to the full actions sheet: an inline emoji row anchored next to the bubble that was long-pressed, iMessage-style. `QuickReactionBar` is the standalone piece if you're not inside a `<Message>`. |
| Read receipts | `ReadReceipt` + `resolveReceiptStatus()` | Chatpack tracks receipts as a per-conversation watermark (`deliveredSeq`, `readMessageId`), not a per-message ledger — `resolveReceiptStatus` derives sent/delivered/read for one message from that, and the convention (matching every messaging app) is to render it only under the sender's *last* message, which your `ItemComponent` decides. |
| Typing indicator | `TypingIndicator` | Three-dot bouncing bubble, fed directly by `useTyping()`'s return value. `transform`-only animation. |
| Scroll to latest | Built into `MessageScroller` | A "↓ Latest" pill appears when scrolled into history; tap to jump back. Swap `ScrollToLatestButtonComponent` for your own, or pass `null` to disable. |
| Keyboard push-up | `ChatKeyboardView` | Wraps `KeyboardAvoidingView` with the iOS/Android behavior difference actually handled (`"padding"` vs `"height"`) — this is the checklist's own #1 flagged "common bug," so it's not left as an exercise. Android also needs `"softwareKeyboardLayoutMode": "resize"` under `"android"` in `app.json`. |

## Usage

```tsx
import { memo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useMessages, useTyping } from "chatpack-expo/react";
import {
  ChatUIProvider,
  ChatKeyboardView,
  MessageScroller,
  Message,
  Marker,
  Composer,
  MessageActionsSheet,
  SwipeToReply,
  TypingIndicator,
  ReadReceipt,
  resolveReceiptStatus,
  isDifferentCalendarDay,
  formatDateMarker,
  type MessageItemProps,
} from "chatpack-expo-ui";
import { chat } from "./lib/chat";

function MessageRow({ message, previousMessage, nextMessage }: MessageItemProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <>
      {isDifferentCalendarDay(previousMessage, message) && (
        <Marker variant="date" label={formatDateMarker(new Date(message.createdAt))} />
      )}
      <SwipeToReply onReply={() => console.log("reply to", message.id)}>
        <Message message={message} previousMessage={previousMessage} nextMessage={nextMessage}>
          <Message.Bubble onLongPress={() => setActionsOpen(true)} />
        </Message>
      </SwipeToReply>
      <MessageActionsSheet message={message} isPresented={actionsOpen} onDismiss={() => setActionsOpen(false)} />
    </>
  );
}
const MemoMessageRow = memo(MessageRow);

export function ConversationScreen({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const { data } = useMessages(chat, { conversationId });
  const typing = useTyping(chat, { conversationId });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ChatUIProvider
        currentUserId={currentUserId}
        onReply={(id) => console.log("reply", id)}
        onReact={(id, emoji) => chat.api.reactions.add({ messageId: id, emoji })}
        onDeleteMessage={(id) => chat.api.messages.delete({ messageId: id })}
      >
        <ChatKeyboardView>
          <MessageScroller messages={data?.messages ?? []} ItemComponent={MemoMessageRow} />
          <TypingIndicator typing={typing} />
          <Composer onSend={(body) => chat.api.messages.send({ conversationId, body })} />
        </ChatKeyboardView>
      </ChatUIProvider>
    </GestureHandlerRootView>
  );
}
```

Exact hook/API method names (`chat.api.reactions.add`, etc.) depend on
`@chatpack/client`'s actual surface — check `chatpack-expo/react`'s
re-exports before copying this verbatim.

## Everything here is meant to be edited, not just configured

Every visual component takes a `style` override that **merges** with (never
replaces) its computed styles, plus a `className` for Tailwind/NativeWind.
Theming goes through `ChatUIProvider`'s `theme` prop (`ChatTheme` — see
`src/theme/tokens.ts`), not hidden constants. Context hooks (`useChatUI`,
`useMessageContext`) are exported specifically so you can build a
replacement for any one piece — a different `Bubble`, a custom attachment
renderer, a different quick-reaction set — on the same state instead of
forking the whole package. `MessageActionsSheet`'s `actions` prop and
`MessageScroller`'s `ScrollToLatestButtonComponent` are the same pattern
applied to bigger pieces: override completely, or use the exported builder
(`buildDefaultMessageActions`) as a starting point. If you find yourself
passing a prop *around* a limitation instead of just changing the
component, that's a sign to fork the file into your app instead of fighting
the package's shape.

## Status

Built and typechecked against `@chatpack/client`, `@expo/ui@57`,
`@shopify/flash-list@2`, `react-native-gesture-handler@3`, on React Native
0.86 / React 19.2 (the versions Expo SDK 57's own `create-expo-app`
installs). Grouping/date-marker logic has unit test coverage (`npm test`).
**Not yet run in a real Expo app** — unlike `chatpack-expo`'s transport
layer, these components haven't been exercised in the iOS Simulator yet.
That's the next step before either package is published.
