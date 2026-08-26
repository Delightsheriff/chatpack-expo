# chatpack-expo-ui

shadcn/ui's chat component set — `Message`, `Bubble`, `Attachment`, `Marker`,
`MessageScroller` — ported to React Native/Expo, built on top of
[`chatpack-expo`](https://github.com/chddaniel/chatpack) and
`@chatpack/client`'s hooks. Structural and behavioral parity with the shadcn
originals, not just a visual re-skin: turn anchoring, live-edge follow,
swipe-to-reply, hold-to-react, read receipts, typing indicators, and
cross-platform keyboard push-up are all here, translated to RN's actual
platform primitives rather than approximated.

This package does not reimplement any of Chatpack's domain logic — it only
renders whatever `useMessages`/`useConversations`/`useTyping`/`useReceipts`
(re-exported from `chatpack-expo/react`) already give you.

## Install

```sh
npm install chatpack-expo-ui chatpack-expo @chatpack/client @expo/ui @shopify/flash-list expo-image expo-linear-gradient react-native-reanimated react-native-worklets react-native-gesture-handler
```

`@expo/ui` requires Expo SDK 57+ (true native SwiftUI/Jetpack Compose
views, not JS-rendered RN views) — this package targets Expo apps
specifically, unlike `chatpack-expo` itself which also works in bare RN.

Wrap your app root in `GestureHandlerRootView` (from
`react-native-gesture-handler`) — required for `SwipeToReply`.

### Optional: NativeWind / Tailwind

Every component accepts a `className` prop alongside `style`. Nothing here
imports `nativewind` unconditionally — it works with zero setup via
`style`/`ChatUIProvider`'s `theme` prop. To use `className`:

```sh
npm install nativewind tailwindcss
```

and enable NativeWind's babel/metro transform per its own
[quick start](https://www.nativewind.dev/quick-starts/expo) — `className`
then works anywhere in your tree, including inside this package, with
nothing further from you. `MessageScroller`'s `className` (on the
underlying `FlashList`, which NativeWind doesn't auto-patch) is wired up
via `cssInterop` automatically, and is a no-op if `nativewind` isn't
installed. Other styling systems work the same way — `className` is
additive, never a replacement for `style`.

## Composition

```
ChatUIProvider
└── MessageScrollerProvider (messages, isTurnAnchor)
    └── MessageScroller (ItemComponent)
        └── your ItemComponent, per row:
            └── MessageScrollerItem (messageId, scrollAnchor)
                └── Message (message, previousMessage, nextMessage)
                    ├── Message.Avatar
                    └── Message.Content
                        ├── Message.Header
                        ├── Message.Bubble
                        │   └── Message.BubbleReactions
                        ├── Message.Attachment (Media/Content/Title/Description/Actions)
                        └── Message.Footer
                            └── ReadReceipt
```

## Core concept: turn anchoring

The behavioral heart of `MessageScroller`, and the reason it isn't just an
inverted `FlatList`. A **turn** is whatever should start a fresh exchange —
by default, the viewer's own message. When a new turn is appended, the
viewport scrolls it to sit *near the top* of what's visible, and the reply
streams into the space below it — rather than the reader being pulled to a
constantly-moving bottom edge.

```tsx
<MessageScrollerProvider
  messages={messages}                 // ascending chronological — oldest first
  isTurnAnchor={(m) => m.senderId === currentUserId}  // this is also the default
  scrollPreviousItemPeek={24}         // px of the prior turn kept visible above the new one
  autoScroll                          // follow the live edge — only while actually at it
  defaultScrollPosition="last-anchor" // "start" | "end" | "last-anchor"
>
  <MessageScroller ItemComponent={MessageRow} onLoadOlder={loadOlder} />
</MessageScrollerProvider>
```

`autoScroll` and `preserveScrollOnPrepend` (default `true`) map directly to
FlashList v2's `maintainVisibleContentPosition` — "follow only while at the
live edge, release on any scroll away, preserve position when history is
prepended" is FlashList's own native behavior here, not hand-rolled scroll
math.

## Usage

```tsx
import { memo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useMessages, useTyping } from "chatpack-expo/react";
import {
  ChatUIProvider,
  ChatKeyboardView,
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerItem,
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

const isTurnAnchor = (m) => m.senderId === "me"; // pass the SAME function to both spots below

function MessageRow({ message, previousMessage, nextMessage, isAnchor }: MessageItemProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <MessageScrollerItem messageId={message.id} scrollAnchor={isAnchor}>
      {isDifferentCalendarDay(previousMessage, message) && (
        <Marker variant="separator"><Marker.Content>{formatDateMarker(new Date(message.createdAt))}</Marker.Content></Marker>
      )}
      <SwipeToReply onReply={() => console.log("reply to", message.id)}>
        <Message message={message} previousMessage={previousMessage} nextMessage={nextMessage}>
          <Message.Avatar><Avatar uri={sender(message).avatarUrl} /></Message.Avatar>
          <Message.Content>
            <Message.Header>{sender(message).name}</Message.Header>
            <Message.Bubble onLongPress={() => setActionsOpen(true)} />
            <Message.Footer><ReadReceipt status={resolveReceiptStatus(message, receipt)} /></Message.Footer>
          </Message.Content>
        </Message>
      </SwipeToReply>
      <MessageActionsSheet message={message} isPresented={actionsOpen} onDismiss={() => setActionsOpen(false)} />
    </MessageScrollerItem>
  );
}
const MemoMessageRow = memo(MessageRow);

export function ConversationScreen({ conversationId, currentUserId }) {
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
          <MessageScrollerProvider messages={data?.messages ?? []} isTurnAnchor={isTurnAnchor} scrollPreviousItemPeek={24} autoScroll>
            <MessageScroller ItemComponent={MemoMessageRow} />
          </MessageScrollerProvider>
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

## Component reference

| shadcn / checklist item | This package |
| --- | --- |
| `MessageScrollerProvider` | Same name. Computes turn anchors once from `isTurnAnchor` over the full `messages` array (see platform-difference note on `MessageScrollerItem` below); owns the `FlashListRef` bridge and two `useSyncExternalStore`-backed stores (visibility, scrollable-edges) so scroll updates never re-render the transcript. |
| `MessageScroller` / `MessageScrollerViewport` / `MessageScrollerContent` | `MessageScroller` (the three web parts collapse into one — FlashList owns its virtualized content directly, with no separable inner node to wrap independently). |
| `MessageScrollerItem` | Same name, same prop shape (`messageId`, `scrollAnchor`) — but presentational only in this port; see its own doc comment for why (FlashList recycling vs. persistent DOM nodes). |
| `MessageScrollerButton` | Same name. Goes inert (`accessibilityState.disabled` + `pointerEvents:none`) when nothing to scroll toward, via `useMessageScrollerScrollable`. Swappable through `MessageScroller`'s `ButtonComponent` prop. |
| `useMessageScroller` / `useMessageScrollerVisibility` / `useMessageScrollerScrollable` | Same names, same shapes (`scrollToMessage`/`scrollToEnd`/`scrollToStart`; `currentAnchorId`/`visibleMessageIds`; `{start, end}`). `scrollToMessage` never needs to "queue" a not-yet-mounted target — FlashList scrolls against the full data array regardless of what's currently rendered. |
| `Message` (compound: `Avatar`/`Header`/`Content`/`Footer`/`Group`) | Same names. `Message.Avatar` offsets itself by `Message.Footer`'s *measured* height (`onLayout`, not a guessed constant) to stay aligned with the bubble instead of the footer, and renders invisible-but-space-reserving on non-last rows of a group. |
| `Bubble` (7 variants, `BubbleReactions`, `BubbleGroup`) | `Message.Bubble` / `Bubble`. All 7 variants (`default`/`secondary`/`muted`/`tinted`/`outline`/`ghost`/`destructive`). `BubbleReactions` is a child detected by `displayName`, not auto-populated — build it from `message.reactions` yourself (plain data, no transform needed). No separate `BubbleGroup`: grouping is already computed per-`Message` from `previousMessage`/`nextMessage`. |
| `Attachment` (state/size/orientation, `Media`/`Content`/`Title`/`Description`/`Actions`/`Group`) | Same shape, minus a separate `AttachmentTrigger` — RN's nested-`Pressable` touch handling doesn't have the DOM stacking-order problem a full-card link has over its own action buttons, so `Attachment`'s own `onPress` covers it. `AttachmentAction`'s `accessibilityLabel` is a required prop, not optional. |
| `Marker` (`default`/`border`/`separator`, `Icon`/`Content`) | Same shape. `role="status"` → `accessibilityLiveRegion="polite"` on Android, `AccessibilityInfo.announceForAccessibility` on iOS (no live-region equivalent there). Shimmer is `MarkerContent`'s `shimmer` prop, not a `Marker` variant. |
| Swipe to reply | `SwipeToReply` — `Gesture.Pan`, `transform`-only animation. A standalone wrapper, not baked into `Message`/`Bubble`. |
| Hold to react | `Message.QuickReactions` / `QuickReactionBar` — a lighter inline alternative (or addition) to the full `MessageActionsSheet`. |
| Long-press actions | `MessageActionsSheet` — native `@expo/ui` `BottomSheet`. `actions` prop takes an arbitrary `MessageAction[]` (forward/report/pin/anything); `buildDefaultMessageActions()` gives the reply/copy/delete starting point to extend. |
| Read receipts | `ReadReceipt` + `resolveReceiptStatus()` — derived from Chatpack's per-conversation receipt watermark (`deliveredSeq`/`readMessageId`), not a per-message ledger; convention (matching every messaging app) is to render only under the sender's *last* message. |
| Typing indicator | `TypingIndicator` — bouncing-dots bubble off `useTyping()`. |
| Keyboard push-up | `ChatKeyboardView` — the iOS/Android `KeyboardAvoidingView` behavior difference actually handled; Android also needs `"softwareKeyboardLayoutMode": "resize"` under `"android"` in `app.json`. |
| `scroll-fade` utility | `ScrollFade` (`expo-linear-gradient`), used internally by `Attachment.Group` and exported standalone. |
| `shimmer` utility | `ShimmerText`, used by `AttachmentTitle`/`MarkerContent`, exported standalone. |

## Translated from the web version, on purpose

A few things don't (and can't) carry over 1:1 from DOM/ARIA to RN:

- **No render-prop polymorphism.** `Bubble`/`Marker`/`Attachment` have no
  `render` prop — RN has no equivalent. Wrap the component in your own
  `Pressable`/link for button/link semantics beyond `onLongPress`/`onPress`.
- **No CSS scroll-snap in `AttachmentGroup`.** RN's snap APIs need fixed or
  precomputed card widths, which a group of arbitrarily-sized cards doesn't
  have. Use a consistent `size` across cards and roll your own
  `snapToInterval` if you need real snapping.
- **`Marker`'s `role="status"` announcement is best-effort on iOS**, via a
  small text-extraction walk over `children` (RN can't read an ARIA
  accessible name off arbitrary elements the way the web can) — non-text
  children won't be announced there.
- **`MessageScrollerItem`'s `scrollAnchor` prop is presentational only** —
  see its own doc comment for the FlashList-recycling reason the real
  anchor list lives on `MessageScrollerProvider`'s `isTurnAnchor` instead.

## Everything here is meant to be edited, not just configured

Every visual component takes a `style` override that **merges** with (never
replaces) its computed styles, plus `className` for Tailwind/NativeWind.
Theming goes through `ChatUIProvider`'s `theme` prop (`ChatTheme` — see
`src/theme/tokens.ts`). Context hooks (`useChatUI`, `useMessageContext`) are
exported so you can build a replacement for any one piece on the same
state instead of forking the whole package. If you find yourself passing a
prop *around* a limitation instead of just changing the component, that's a
sign to fork the file into your app instead of fighting the package's shape.

## Status

Full structural/behavioral rebuild against shadcn's actual chat component
docs (`Message`, `Bubble`, `Attachment`, `Marker`, `MessageScroller`).
Typechecks and builds clean against `@chatpack/client`, `@expo/ui@57`,
`@shopify/flash-list@2`, `react-native-gesture-handler@3`, on React Native
0.86 / React 19.2. Grouping/date-marker logic has unit test coverage
(`npm test`). **Not yet run in a real Expo app** — the `MessageScroller`
rebuild in particular (`maintainVisibleContentPosition` mapping,
`scrollToIndex` peek math) is implemented per FlashList v2's documented
API but unverified on-device. That's the next step before either this
package or `chatpack-expo` is published.
