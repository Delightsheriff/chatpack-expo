import { Attachment as AttachmentRoot } from "./Attachment";
import { AttachmentMedia } from "./AttachmentMedia";
import { AttachmentContent } from "./AttachmentContent";
import { AttachmentTitle } from "./AttachmentTitle";
import { AttachmentDescription } from "./AttachmentDescription";
import { AttachmentActions } from "./AttachmentActions";
import { AttachmentAction } from "./AttachmentAction";
import { AttachmentGroup } from "./AttachmentGroup";

/**
 * `<Attachment>` as a compound namespace, mirroring shadcn's composition:
 *
 * ```tsx
 * <Attachment state="uploading">
 *   <Attachment.Media><FileIcon /></Attachment.Media>
 *   <Attachment.Content>
 *     <Attachment.Title>sales-dashboard.pdf</Attachment.Title>
 *     <Attachment.Description>Uploading · 64%</Attachment.Description>
 *   </Attachment.Content>
 *   <Attachment.Actions>
 *     <Attachment.Action accessibilityLabel="Remove sales-dashboard.pdf" onPress={remove}>
 *       <XIcon />
 *     </Attachment.Action>
 *   </Attachment.Actions>
 * </Attachment>
 * ```
 */
export const Attachment = Object.assign(AttachmentRoot, {
  Media: AttachmentMedia,
  Content: AttachmentContent,
  Title: AttachmentTitle,
  Description: AttachmentDescription,
  Actions: AttachmentActions,
  Action: AttachmentAction,
  Group: AttachmentGroup,
});

export { AttachmentMedia } from "./AttachmentMedia";
export type { AttachmentMediaProps } from "./AttachmentMedia";
export { AttachmentContent } from "./AttachmentContent";
export type { AttachmentContentProps } from "./AttachmentContent";
export { AttachmentTitle } from "./AttachmentTitle";
export type { AttachmentTitleProps } from "./AttachmentTitle";
export { AttachmentDescription } from "./AttachmentDescription";
export type { AttachmentDescriptionProps } from "./AttachmentDescription";
export { AttachmentActions } from "./AttachmentActions";
export type { AttachmentActionsProps } from "./AttachmentActions";
export { AttachmentAction } from "./AttachmentAction";
export type { AttachmentActionProps } from "./AttachmentAction";
export { AttachmentGroup } from "./AttachmentGroup";
export type { AttachmentGroupProps } from "./AttachmentGroup";
export type { AttachmentProps } from "./Attachment";
export type { AttachmentState, AttachmentSize, AttachmentOrientation } from "./context";
export { attachmentsFromMetadata } from "./metadata";
export type { ChatAttachment } from "./metadata";
