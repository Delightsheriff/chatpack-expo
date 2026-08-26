export { ChatUIProvider, useChatUI } from "./context/ChatUIProvider";
export type { ChatUIState, ChatUIActions, ChatUIProviderProps } from "./context/ChatUIProvider";

export { lightTheme, darkTheme } from "./theme/tokens";
export type { ChatTheme, ChatColors, ChatSpacing, ChatRadius, ChatTypography } from "./theme/tokens";

export {
  Message,
  MessageAvatar,
  MessageHeader,
  MessageContent,
  MessageFooter,
  MessageGroup,
  Bubble,
  BubbleReactions,
  MessageQuickReactions,
  useMessageContext,
} from "./components/message";
export type {
  MessageProps,
  MessageAlign,
  MessageAvatarProps,
  MessageHeaderProps,
  MessageContentProps,
  MessageFooterProps,
  MessageGroupProps,
  BubbleProps,
  BubbleVariant,
  BubbleAlign,
  BubbleReactionsProps,
  BubbleReactionsSide,
  BubbleReactionsAlign,
  MessageQuickReactionsProps,
  MessageContextValue,
} from "./components/message";

export {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentGroup,
  attachmentsFromMetadata,
} from "./components/attachment";
export type {
  AttachmentProps,
  AttachmentMediaProps,
  AttachmentContentProps,
  AttachmentTitleProps,
  AttachmentDescriptionProps,
  AttachmentActionsProps,
  AttachmentActionProps,
  AttachmentGroupProps,
  AttachmentState,
  AttachmentSize,
  AttachmentOrientation,
  ChatAttachment,
} from "./components/attachment";

export { ScrollFade } from "./utils/ScrollFade";
export type { ScrollFadeProps } from "./utils/ScrollFade";

export { MessageScroller } from "./components/MessageScroller";
export type { MessageScrollerProps, MessageItemProps, ScrollToLatestButtonProps } from "./components/MessageScroller";

export { Marker } from "./components/Marker";
export type { MarkerProps, MarkerVariant } from "./components/Marker";

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
