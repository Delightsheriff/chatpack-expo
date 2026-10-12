import { createRequiredContext } from "../../utils/createRequiredContext";

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";
export type AttachmentSize = "default" | "sm" | "xs";
export type AttachmentOrientation = "horizontal" | "vertical";

export interface AttachmentContextValue {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
}

export const [AttachmentContext, useAttachmentContext] = createRequiredContext<AttachmentContextValue>("Attachment");

export const ATTACHMENT_MEDIA_SIZE: Record<AttachmentSize, number> = {
  default: 40,
  sm: 32,
  xs: 24,
};
