export { ChatUIProvider, useChatUI } from "./context/ChatUIProvider";
export type { ChatUIState, ChatUIActions, ChatUIProviderProps } from "./context/ChatUIProvider";

export { lightTheme, darkTheme } from "./theme/tokens";
export type { ChatTheme, ChatColors, ChatSpacing, ChatRadius, ChatTypography } from "./theme/tokens";

// message/, attachment/, marker/, and scroller/ each already curate their
// own public surface in their own index.ts (that's the one list worth
// hand-maintaining — it's short and changes rarely). Re-listing every name
// a second time here bought nothing but a second place to forget to update
// (architecture review, 2026-08-26, candidate 6) — `export *` collapses
// that to one sync point instead of two. `Attachment`/`attachmentsFromMetadata`
// are re-exported from both message/ and attachment/ (the same binding,
// not a naming collision) since `Message.Attachment` needs them too.
export * from "./components/message";
export * from "./components/attachment";
export * from "./components/scroller";
export * from "./components/marker";

export { ScrollFade } from "./utils/ScrollFade";
export type { ScrollFadeProps } from "./utils/ScrollFade";

export { Composer } from "./components/Composer";
export type { ComposerProps } from "./components/Composer";

export { ChatKeyboardView } from "./components/ChatKeyboardView";
export type { ChatKeyboardViewProps } from "./components/ChatKeyboardView";

export { MessageActionsSheet, buildDefaultMessageActions, DEFAULT_QUICK_REACTIONS } from "./components/MessageActionsSheet";
export type { MessageActionsSheetProps, MessageAction } from "./components/MessageActionsSheet";

export { QuickReactionBar } from "./components/QuickReactionBar";
export type { QuickReactionBarProps } from "./components/QuickReactionBar";

export { SwipeToReply } from "./components/SwipeToReply";
export type { SwipeToReplyProps } from "./components/SwipeToReply";

export { TypingIndicator } from "./components/TypingIndicator";
export type { TypingIndicatorProps } from "./components/TypingIndicator";

export { ReadReceipt, resolveReceiptStatus } from "./components/ReadReceipt";
export type { ReadReceiptProps, ReceiptStatus } from "./components/ReadReceipt";

export { ShimmerText } from "./utils/shimmer";
export type { ShimmerTextProps } from "./utils/shimmer";

export {
  isSameGroup,
  isDifferentCalendarDay,
  formatDateMarker,
  formatTimestamp,
  DEFAULT_GROUPING_WINDOW_MS,
} from "./utils/grouping";
