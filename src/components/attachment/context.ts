import { createContext, useContext } from "react";

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";
export type AttachmentSize = "default" | "sm" | "xs";
export type AttachmentOrientation = "horizontal" | "vertical";

export interface AttachmentContextValue {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
}

export const AttachmentContext = createContext<AttachmentContextValue | null>(null);

export function useAttachmentContext(): AttachmentContextValue {
  const ctx = useContext(AttachmentContext);
  if (!ctx) {
    throw new Error("This component must be rendered inside an <Attachment> root.");
  }
  return ctx;
}

export const ATTACHMENT_MEDIA_SIZE: Record<AttachmentSize, number> = {
  default: 40,
  sm: 32,
  xs: 24,
};
