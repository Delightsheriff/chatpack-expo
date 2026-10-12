/**
 * Chatpack's core has no media pipeline (its docs: "does not store device
 * tokens", no attachment table) — an attachment is an app convention
 * living in a message's `metadata`. This is that convention's shape; apps
 * that write attachments into `metadata.attachments` on send can read them
 * back with `attachmentsFromMetadata`. A different convention just means
 * not using this helper — the `Attachment` compound components don't
 * depend on it themselves.
 */
export interface ChatAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name?: string;
  /** Bytes, for a file-card size label. */
  size?: number;
  width?: number;
  height?: number;
}

export function attachmentsFromMetadata(metadata: Record<string, unknown>): ChatAttachment[] {
  const raw = metadata["attachments"];
  return Array.isArray(raw) ? (raw as ChatAttachment[]) : [];
}
