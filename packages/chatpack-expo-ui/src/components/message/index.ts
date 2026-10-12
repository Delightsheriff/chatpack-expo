import { Message as MessageRoot } from "./Message";
import { MessageAvatar } from "./MessageAvatar";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";
import { MessageFooter } from "./MessageFooter";
import { MessageGroup } from "./MessageGroup";
import { Bubble } from "./Bubble";
import { BubbleQuote } from "./BubbleQuote";
import { BubbleReactions } from "./BubbleReactions";
import { Attachment } from "../attachment";
import { MessageQuickReactions } from "./QuickReactions";

/**
 * `<Message>` as a compound namespace, mirroring shadcn's composition tree:
 *
 * ```tsx
 * <Message message={m} previousMessage={prev} nextMessage={next}>
 *   <Message.Avatar><Avatar uri={sender.avatarUrl} /></Message.Avatar>
 *   <Message.Content>
 *     <Message.Header>{sender.name}</Message.Header>
 *     <Message.Bubble />
 *     <Message.Footer><ReadReceipt status="read" /></Message.Footer>
 *   </Message.Content>
 * </Message>
 * ```
 *
 * Each piece is also a plain named export below, for a consumer that wants
 * one on its own without the namespace.
 */
export const Message = Object.assign(MessageRoot, {
  Avatar: MessageAvatar,
  Header: MessageHeader,
  Content: MessageContent,
  Footer: MessageFooter,
  Group: MessageGroup,
  Bubble,
  BubbleQuote,
  BubbleReactions,
  Attachment,
  QuickReactions: MessageQuickReactions,
});

export { MessageAvatar } from "./MessageAvatar";
export type { MessageAvatarProps } from "./MessageAvatar";
export { MessageHeader } from "./MessageHeader";
export type { MessageHeaderProps } from "./MessageHeader";
export { MessageContent } from "./MessageContent";
export type { MessageContentProps } from "./MessageContent";
export { MessageFooter } from "./MessageFooter";
export type { MessageFooterProps } from "./MessageFooter";
export { MessageGroup } from "./MessageGroup";
export type { MessageGroupProps } from "./MessageGroup";
export { Bubble } from "./Bubble";
export type { BubbleProps, BubbleVariant, BubbleAlign } from "./Bubble";
export { BubbleQuote } from "./BubbleQuote";
export type { BubbleQuoteProps } from "./BubbleQuote";
export { BubbleReactions } from "./BubbleReactions";
export type { BubbleReactionsProps, BubbleReactionsSide, BubbleReactionsAlign } from "./BubbleReactions";
export { Attachment, attachmentsFromMetadata } from "../attachment";
export type { AttachmentProps, ChatAttachment } from "../attachment";
export { MessageQuickReactions } from "./QuickReactions";
export type { MessageQuickReactionsProps } from "./QuickReactions";
export type { MessageProps, MessageAlign } from "./Message";
export { useMessageContext } from "./context";
export type { MessageContextValue } from "./context";
