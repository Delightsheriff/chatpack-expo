export { ChatUIProvider, useChatUI } from "./context/ChatUIProvider";
export type { ChatUIState, ChatUIActions, ChatUIProviderProps } from "./context/ChatUIProvider";

export { lightTheme, darkTheme } from "./theme/tokens";
export type { ChatTheme, ChatColors, ChatSpacing, ChatRadius, ChatTypography } from "./theme/tokens";

export { Message, Bubble, Attachment, attachmentsFromMetadata, useMessageContext } from "./components/message";
export type {
  MessageProps,
  BubbleProps,
  BubbleVariant,
  AttachmentProps,
  ChatAttachment,
  MessageContextValue,
} from "./components/message";

export { MessageScroller } from "./components/MessageScroller";
export type { MessageScrollerProps, MessageItemProps } from "./components/MessageScroller";

export { Marker } from "./components/Marker";
export type { MarkerProps, MarkerVariant } from "./components/Marker";

export { Composer } from "./components/Composer";
export type { ComposerProps } from "./components/Composer";

export { MessageActionsSheet, DEFAULT_QUICK_REACTIONS } from "./components/MessageActionsSheet";
export type { MessageActionsSheetProps } from "./components/MessageActionsSheet";

export { ShimmerText } from "./utils/shimmer";
export type { ShimmerTextProps } from "./utils/shimmer";

export {
  isSameGroup,
  isDifferentCalendarDay,
  formatDateMarker,
  formatTimestamp,
  DEFAULT_GROUPING_WINDOW_MS,
} from "./utils/grouping";
