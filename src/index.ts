export { ChatUIProvider, useChatUI, useChatConfig, useChatTheme, useChatComponent } from "./context/ChatUIProvider";
export type { ChatUIState, ChatUIActions, ChatUIConfig, ChatUIProviderProps } from "./context/ChatUIProvider";

// Customization: slot styles, labels, icons, component overrides, haptics, clipboard.
export { useSlots } from "./customization/useSlots";
export { createSlotResolver, fontStyle } from "./customization/resolveSlots";
export type { SlotResolver, FontWeightName } from "./customization/resolveSlots";
export type {
  ChatSlotRegistry,
  SlotDefinition,
  ChatComponentName,
  ChatComponentStyles,
  SlotStyle,
  SlotStyles,
  SlotClassNames,
  SlotProps,
  SlotsOf,
  SlotStateOf,
} from "./customization/slots";
export { defaultLabels } from "./customization/labels";
export type { ChatLabels, ChatLabelOverrides } from "./customization/labels";
export { ChatIcon, defaultIcons } from "./customization/icons";
export type { ChatIconName, ChatIconProps, ChatIconSource, ChatIcons, ChatSymbolNames, ChatIconComponentProps } from "./customization/icons";
export type { ChatComponentOverrides } from "./customization/components";
export { defaultHaptics, noHaptics, defaultCopyText } from "./customization/feedback";
export type { ChatHaptics, ChatHapticEvent, ChatCopyText } from "./customization/feedback";

export type {
  ChatMessage,
  ChatMessageReference,
  ChatReactionSummary,
  ChatForwardProvenance,
  ChatTypingIndicator,
  ChatReceiptState,
  ChatConversationSummary,
} from "./types";

export { lightTheme, darkTheme, createTheme } from "./theme/tokens";
export type {
  ChatTheme,
  ChatColors,
  ChatSpacing,
  ChatRadius,
  ChatTypography,
  ChatFonts,
  ChatBubbleTokens,
  ChatAvatarTokens,
  DeepPartial,
} from "./theme/tokens";

export * from "./components/message";
export * from "./components/attachment";
export * from "./components/scroller";
export * from "./components/marker";
export * from "./components/list";

export { Avatar } from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";

export { ScrollFade } from "./utils/ScrollFade";
export type { ScrollFadeProps } from "./utils/ScrollFade";

export { SendButton } from "./components/SendButton";
export type { SendButtonProps } from "./components/SendButton";

export { UnreadBadge } from "./components/UnreadBadge";
export type { UnreadBadgeProps } from "./components/UnreadBadge";

export { Composer } from "./components/Composer";
export type { ComposerProps } from "./components/Composer";

export { useComposer } from "./components/useComposer";
export type { UseComposerOptions, UseComposerResult } from "./components/useComposer";

export { ChatKeyboardView, ChatKeyboardScrollView, useChatKeyboard } from "./components/ChatKeyboardView";
export type { ChatKeyboardViewProps, ChatKeyboardDockProps, KeyboardLiftBehavior } from "./components/ChatKeyboardView";

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

