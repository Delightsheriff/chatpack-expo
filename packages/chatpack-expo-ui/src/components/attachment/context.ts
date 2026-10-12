import { useContext } from "react";
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

const DEFAULT_ATTACHMENT_STATE: AttachmentContextValue = { state: "done", size: "default", orientation: "horizontal" };

/** The enclosing `Attachment`'s state, or defaults — for parts that also work standalone. */
export function useOptionalAttachmentContext(): AttachmentContextValue {
  return useContext(AttachmentContext) ?? DEFAULT_ATTACHMENT_STATE;
}
