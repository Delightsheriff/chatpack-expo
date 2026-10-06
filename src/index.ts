export { ChatUIProvider, useChatUI } from "./context/ChatUIProvider";
export type { ChatUIState, ChatUIActions, ChatUIProviderProps } from "./context/ChatUIProvider";

export type {
  ChatMessage,
  ChatMessageReference,
  ChatReactionSummary,
  ChatForwardProvenance,
  ChatTypingIndicator,
  ChatReceiptState,
  ChatConversationSummary,
} from "./types";

export { lightTheme, darkTheme } from "./theme/tokens";
export type { ChatTheme, ChatColors, ChatSpacing, ChatRadius, ChatTypography } from "./theme/tokens";

export * from "./components/message";
export * from "./components/attachment";
export * from "./components/scroller";
export * from "./components/marker";
export * from "./components/list";

export { Avatar } from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";

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
  formatConversationTimestamp,
  DEFAULT_GROUPING_WINDOW_MS,
} from "./utils/grouping";

