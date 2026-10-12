import type { ComponentType } from "react";
import type { AvatarProps } from "../components/Avatar";
import type { ReadReceiptProps } from "../components/ReadReceipt";
import type { SendButtonProps } from "../components/SendButton";
import type { UnreadBadgeProps } from "../components/UnreadBadge";
import type { MessageScrollerButtonProps } from "../components/scroller/MessageScrollerButton";

/**
 * Sub-components the package renders *inside* its own components (an
 * `Avatar` inside a `ConversationListItem`, a send button inside the
 * `Composer`, …). Replace any of them app-wide on `ChatUIProvider`'s
 * `components` prop when slot styles aren't enough and you need different
 * markup — your component receives the same props the default does.
 *
 * Components you compose yourself (`Message.Bubble`, `TypingIndicator`, …)
 * aren't listed: just render your own in their place.
 */
export interface ChatComponentOverrides {
  Avatar: ComponentType<AvatarProps>;
  ReadReceipt: ComponentType<ReadReceiptProps>;
  SendButton: ComponentType<SendButtonProps>;
  UnreadBadge: ComponentType<UnreadBadgeProps>;
  ScrollButton: ComponentType<MessageScrollerButtonProps>;
}
