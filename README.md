# chatpack-expo-ui

Native-feeling chat UI for Expo / React Native — shadcn/ui's chat component
set (`Message`, `Bubble`, `Attachment`, `Marker`, `MessageScroller`) ported to
RN's real platform primitives, plus the mobile pieces a messenger needs:
keyboard-synced composer, swipe-to-reply, haptics, native SF Symbols /
Material Symbols icons, read receipts, typing indicator, actions sheet and a
conversation list.

**Fully customizable.** Every component is restyleable at four levels —
tokens, named slots, provider overrides, and headless hooks — so the same
components can be an iMessage clone, WhatsApp, or a flat Slack-style
transcript without forking (see [Customization](#customization); the example
app ships all three).

**Backend-agnostic.** Nothing here imports `@chatpack/client` — components
work off this package's own `ChatMessage`/`ChatTypingIndicator`/
`ChatReceiptState` types (`src/types.ts`), which mirror Chatpack's
`ClientMessage` field-for-field, so Chatpack data needs zero conversion and
any other backend just has to match the shape.

## Install

```sh
npx expo install chatpack-expo-ui @shopify/flash-list expo-image expo-linear-gradient \
  expo-symbols expo-haptics expo-clipboard react-native-keyboard-controller \
  react-native-reanimated react-native-worklets react-native-gesture-handler \
  react-native-safe-area-context
```

All of these are in Expo Go (SDK 57). With Chatpack as the backend, also
`npm install chatpack-expo @chatpack/client`.

## Setup

Once, at your app root (Expo Router: `app/_layout.tsx`):

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>   {/* swipe-to-reply */}
      <KeyboardProvider>                            {/* ChatKeyboardView */}
        <Stack />                                   {/* Expo Router provides SafeAreaProvider */}
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
```

No `softwareKeyboardLayoutMode` is needed on Android — keyboard-controller
handles it.

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


## Customization

Four layers, from lightest to heaviest. Reach for the lightest that works.

### 1. Tokens — `createTheme`

```ts
import { createTheme, darkTheme } from "chatpack-expo-ui";

const brand = {
  colors: { accent: "#7C3AED", bubbleSent: "#7C3AED", receiptRead: "#7C3AED" },
  bubble: { radius: 22, groupedRadius: 6, maxWidth: 0.78 },
  avatar: { messageSize: 28, radius: 8 },              // rounded squares
  fonts: { regular: "Inter-Regular", semibold: "Inter-SemiBold", bold: "Inter-Bold" },
};
export const theme = { light: createTheme(brand), dark: createTheme(brand, darkTheme) };

<ChatUIProvider currentUserId={me} theme={theme}>…</ChatUIProvider>
```

Tokens: `colors` (incl. `receiptRead`, `badge`, `online`, `overlay`),
`spacing`, `radius`, `typography`, `fonts` (family per weight — Android
custom fonts need it), `bubble` (radius, grouped radius, padding, max
width), `avatar`. A `{ light, dark }` pair follows the device appearance.

### 2. Slots — `styles` / `classNames` / `theme.components`

Every component names its inner parts. Style them per instance, or app-wide
through `theme.components`. A slot value can be a function of component
state — that's what makes very different designs possible:

```ts
createTheme({
  components: {
    Bubble: {
      // iMessage "tail": a tight corner only on the last bubble of a run
      bubble: ({ bubbleAlign, groupedWithNext }) =>
        groupedWithNext ? null : bubbleAlign === "end" ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 },
      text: { fontSize: 17 },
    },
    Composer: { root: { borderTopWidth: 0 }, inputWrapper: { borderRadius: 20 } },
    ConversationListItem: { title: ({ hasUnread }) => (hasUnread ? { color: "#7C3AED" } : null) },
  },
});

<Composer styles={{ input: { fontFamily: "Inter" } }} classNames={{ root: "px-4" }} />
```

The full list of components, slot names and the state each slot function
receives is one file: [`src/customization/slots.ts`](src/customization/slots.ts).
Order: component defaults → `theme.components` → instance `styles` →
instance `style` (root).

### 3. Provider overrides — labels, icons, components, haptics, clipboard

```tsx
<ChatUIProvider
  currentUserId={me}
  labels={{ composerPlaceholder: "Escribe un mensaje", receipt: { read: "Leído" } }}
  icons={{
    send: { ios: "paperplane.fill", android: "send" },        // native symbol names
    reply: ({ size, color }) => <Feather name="corner-up-left" size={size} color={color} />, // or anything
  }}
  components={{ SendButton: MySendButton, Avatar: MyAvatar }} // Avatar, ReadReceipt, SendButton, UnreadBadge, ScrollButton
  haptics={(event) => event !== "send" && defaultHaptics(event)} // or false
  copyText={(text) => myClipboard.write(text)}
/>
```

Icons default to SF Symbols on iOS and Material Symbols on Android/web via
`expo-symbols`; use `<ChatIcon name="…" />` in your own pieces to stay on
the same set. Haptic events: `send`, `longPress`, `swipeReply`,
`reaction`, `selection`, `copy`.

### 4. Headless — hooks and composition

Compound components (`Message.Avatar`, `Message.Bubble`, …) mean you can
drop or replace any piece of a row. For a completely custom input bar keep
the behavior with `useComposer` (draft, `canSend`, `send` + haptic,
whitespace normalization via `normalizeMessageBody`); `useMessageContext`,
`useMessageScroller`, `useChatTheme`, `useChatConfig` and `useSlots` let you
build new components on the same state and customization system.

## Keyboard

```tsx
<ChatKeyboardView keyboardLiftBehavior="always">   {/* "whenAtEnd" | "persistent" | "never" */}
  <MessageScroller ItemComponent={Row} ListFooterComponent={<TypingIndicator typing={typing} />} />
  <ChatKeyboardView.Dock>
    <Composer onSend={send} topAccessory={replyBar} />
  </ChatKeyboardView.Dock>
</ChatKeyboardView>
```

Built on react-native-keyboard-controller's `KeyboardChatScrollView`: the
transcript lifts with the keyboard frame-by-frame, the list swipes the
keyboard away interactively, and the Dock rides on the keyboard while
padding the home indicator only when it's closed. `mode="avoiding"` wraps a
`KeyboardAvoidingView` instead, for transcripts that aren't `MessageScroller`.

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
                        ├── Message.Bubble (reactions={<Message.BubbleReactions/>})
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

const isTurnAnchor = (m) => m.senderId === "me"; // defined once, given to MessageScrollerProvider below

function MessageRow({ message, previousMessage, nextMessage, isAnchor }: MessageItemProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  // isAnchor is MessageScroller's own isTurnAnchor result for this row, forwarded here —
  // not recomputed. See MessageScrollerItem's scrollAnchor doc comment for why that matters.
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
        onReact={(id, emoji) => chat.messages.react({ messageId: id, emoji })}
        onDeleteMessage={(id) => chat.messages.delete({ messageId: id })}
      >
        <ChatKeyboardView>
          <MessageScrollerProvider messages={[...(data?.messages ?? [])].reverse()} isTurnAnchor={isTurnAnchor} autoScroll>
            <MessageScroller ItemComponent={MemoMessageRow} ListFooterComponent={<TypingIndicator typing={typing} />} />
          </MessageScrollerProvider>
          <ChatKeyboardView.Dock>
            <Composer onSend={(body) => chat.messages.send({ conversationId, body })} />
          </ChatKeyboardView.Dock>
        </ChatKeyboardView>
      </ChatUIProvider>
    </GestureHandlerRootView>
  );
}
```

`useMessages` returns newest-first; `MessageScrollerProvider` wants oldest
first, hence the `reverse()`. The example app (`chatpack-expo-example`) has
the complete, running version of this screen.

## Component reference

| shadcn / checklist item | This package |
| --- | --- |
| `MessageScrollerProvider` | Same name. Computes turn anchors once from `isTurnAnchor` over the full `messages` array (see platform-difference note on `MessageScrollerItem` below); owns the `FlashListRef` bridge and two `useSyncExternalStore`-backed stores (visibility, scrollable-edges) so scroll updates never re-render the transcript. |
| `MessageScroller` / `MessageScrollerViewport` / `MessageScrollerContent` | `MessageScroller` (the three web parts collapse into one — FlashList owns its virtualized content directly, with no separable inner node to wrap independently). |
| `MessageScrollerItem` | Same name, same prop shape (`messageId`, `scrollAnchor`) — but presentational only in this port; see its own doc comment for why (FlashList recycling vs. persistent DOM nodes). Forward `MessageItemProps.isAnchor` into `scrollAnchor` rather than recomputing your `isTurnAnchor` predicate per row — `MessageScroller` already evaluated it once. |
| `MessageScrollerButton` | Same name. Goes inert (`accessibilityState.disabled` + `pointerEvents:none`) when nothing to scroll toward, via `useMessageScrollerScrollable`. Swappable through `MessageScroller`'s `ButtonComponent` prop. |
| `useMessageScroller` / `useMessageScrollerVisibility` / `useMessageScrollerScrollable` | Same names, same shapes (`scrollToMessage`/`scrollToEnd`/`scrollToStart`; `currentAnchorId`/`visibleMessageIds`; `{start, end}`). `scrollToMessage` never needs to "queue" a not-yet-mounted target — FlashList scrolls against the full data array regardless of what's currently rendered. |
| `Message` (compound: `Avatar`/`Header`/`Content`/`Footer`/`Group`) | Same names. `Message.Avatar` offsets itself by `Message.Footer`'s *measured* height (`onLayout`, not a guessed constant) to stay aligned with the bubble instead of the footer, and renders invisible-but-space-reserving on non-last rows of a group. |
| `Bubble` (7 variants, `BubbleReactions`, `BubbleGroup`) | `Message.Bubble` / `Bubble`. All 7 variants (`default`/`secondary`/`muted`/`tinted`/`outline`/`ghost`/`destructive`). `BubbleReactions` is passed via an explicit `reactions` prop, not auto-detected from `children` — build it from `message.reactions` yourself (plain data, no transform needed). No separate `BubbleGroup`: grouping is already computed per-`Message` from `previousMessage`/`nextMessage`. |
| `Attachment` (state/size/orientation, `Media`/`Content`/`Title`/`Description`/`Actions`/`Group`) | Same shape, minus a separate `AttachmentTrigger` — RN's nested-`Pressable` touch handling doesn't have the DOM stacking-order problem a full-card link has over its own action buttons, so `Attachment`'s own `onPress` covers it. `AttachmentAction`'s `accessibilityLabel` is a required prop, not optional. |
| `Marker` (`default`/`border`/`separator`, `Icon`/`Content`) | Same shape. `role="status"` → `accessibilityLiveRegion="polite"` on Android, `AccessibilityInfo.announceForAccessibility` on iOS (no live-region equivalent there). Shimmer is `MarkerContent`'s `shimmer` prop, not a `Marker` variant. |
| Swipe to reply | `SwipeToReply` — `Gesture.Pan`, `transform`-only animation. A standalone wrapper, not baked into `Message`/`Bubble`. |
| Hold to react | `Message.QuickReactions` / `QuickReactionBar` — a lighter inline alternative (or addition) to the full `MessageActionsSheet`. |
| Long-press actions | `MessageActionsSheet` — one per screen, driven by `onOpenActions`. Quick-reaction row plus an icon action list; `buildDefaultMessageActions(message, actions, config)` gives Reply / Copy (built in, system clipboard) / Forward / Delete to extend. |
| Read receipts | `ReadReceipt` (native tick icons or text labels) + `resolveReceiptStatus()` — derived from Chatpack's per-conversation receipt watermark (`deliveredSeq`/`readMessageId`), not a per-message ledger; convention (matching every messaging app) is to render only under the sender's *last* message. |
| Typing indicator | `TypingIndicator` — bouncing-dots bubble off `useTyping()`. |
| Keyboard push-up | `ChatKeyboardView` + `ChatKeyboardView.Dock` on react-native-keyboard-controller — see [Keyboard](#keyboard). |
| Composer | `Composer` (icon `SendButton`, top/leading/trailing accessories, auto-height, whitespace normalization) or headless `useComposer`. |
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
  Forward `MessageItemProps.isAnchor` into it (see the usage example above)
  rather than calling your own predicate a second time per row — one
  evaluation, one place it can disagree with itself.

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

Rebuilt for a native feel and full customization (October 2026): theme
builder, slot registry, provider overrides, expo-symbols icons, haptics,
clipboard, keyboard-controller layout, headless composer. Typechecks, builds
and has unit tests (`npm test`) for theme merging, slot resolution, labels,
message normalization and grouping.

Run in Expo Go on the iOS 27 simulator (iPhone 18 Pro) via the example app:
conversation list, header search, native tabs, all four designs, sending,
long-press actions sheet, reply bar and receipts verified on screen. **Not yet
verified:** the software-keyboard lift and interactive dismiss (the test ran
with a hardware keyboard attached), Android, and real devices.
