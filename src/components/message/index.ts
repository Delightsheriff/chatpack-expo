import { Message as MessageRoot } from "./Message";
import { Bubble } from "./Bubble";
import { BubbleReactions } from "./BubbleReactions";
import { Attachment } from "./Attachment";
import { MessageQuickReactions } from "./QuickReactions";

/**
 * `<Message>` as a compound namespace — `Message.Bubble`,
 * `Message.Attachment`, `Message.QuickReactions` — so a consumer composes
 * a row explicitly:
 *
 * ```tsx
 * <Message message={m} previousMessage={prev} nextMessage={next}>
 *   <Message.Bubble onLongPress={() => setReacting(true)} />
 *   <Message.QuickReactions isVisible={reacting} onDismiss={() => setReacting(false)} />
 * </Message>
 * ```
 *
 * Each piece is also a plain named export below, for a consumer that wants
 * `Bubble` on its own without the namespace.
 */
export const Message = Object.assign(MessageRoot, {
  Bubble,
  BubbleReactions,
  Attachment,
  QuickReactions: MessageQuickReactions,
});

export { Bubble } from "./Bubble";
export type { BubbleProps, BubbleVariant, BubbleAlign } from "./Bubble";
export { BubbleReactions } from "./BubbleReactions";
export type { BubbleReactionsProps, BubbleReactionsSide, BubbleReactionsAlign } from "./BubbleReactions";
export { Attachment, attachmentsFromMetadata } from "./Attachment";
export type { AttachmentProps, ChatAttachment } from "./Attachment";
export { MessageQuickReactions } from "./QuickReactions";
export type { MessageQuickReactionsProps } from "./QuickReactions";
export type { MessageProps } from "./Message";
export { useMessageContext } from "./context";
export type { MessageContextValue } from "./context";
