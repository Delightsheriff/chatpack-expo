import { Message as MessageRoot } from "./Message";
import { Bubble } from "./Bubble";
import { Attachment } from "./Attachment";

/**
 * `<Message>` as a compound namespace — `Message.Bubble`,
 * `Message.Attachment` — so a consumer composes a row explicitly:
 *
 * ```tsx
 * <Message message={m} previousMessage={prev} nextMessage={next}>
 *   <Message.Bubble />
 *   {attachments.map(a => <Message.Attachment key={a.id} attachment={a} />)}
 * </Message>
 * ```
 *
 * Each piece is also a plain named export below, for a consumer that wants
 * `Bubble` on its own without the namespace.
 */
export const Message = Object.assign(MessageRoot, { Bubble, Attachment });

export { Bubble } from "./Bubble";
export type { BubbleProps, BubbleVariant } from "./Bubble";
export { Attachment, attachmentsFromMetadata } from "./Attachment";
export type { AttachmentProps, ChatAttachment } from "./Attachment";
export type { MessageProps } from "./Message";
export { useMessageContext } from "./context";
export type { MessageContextValue } from "./context";
