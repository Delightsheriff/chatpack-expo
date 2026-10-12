import type { ReceiptStatus } from "../components/ReadReceipt";

/**
 * Every user-visible string the package renders on its own (as opposed to
 * your data). Override any subset on `ChatUIProvider`'s `labels` prop — for
 * copy/tone changes or full localization.
 */
export interface ChatLabels {
  composerPlaceholder: string;
  /** Accessibility label for the send button (the visible button is an icon). */
  send: string;
  messageDeleted: string;
  quoteDeleted: string;
  reply: string;
  copy: string;
  forward: string;
  delete: string;
  cancel: string;
  /** Section title above the quick-reaction row in the actions sheet. */
  react: string;
  receipt: Record<ReceiptStatus, string>;
  jumpToLatest: string;
  jumpToStart: string;
  searchPlaceholder: string;
  addStory: string;
  /** Text inside an unread badge, e.g. `99+` past a cap. */
  unreadCount: (count: number) => string;
}

export const defaultLabels: ChatLabels = {
  composerPlaceholder: "Message",
  send: "Send",
  messageDeleted: "Message deleted",
  quoteDeleted: "Original message deleted",
  reply: "Reply",
  copy: "Copy",
  forward: "Forward",
  delete: "Delete",
  cancel: "Cancel",
  react: "React",
  receipt: {
    sending: "Sending…",
    sent: "Sent",
    delivered: "Delivered",
    read: "Read",
    failed: "Failed to send",
  },
  jumpToLatest: "Latest",
  jumpToStart: "Start",
  searchPlaceholder: "Search",
  addStory: "Add",
  unreadCount: (count) => (count > 99 ? "99+" : String(count)),
};

/** What `ChatUIProvider`'s `labels` prop accepts — any subset, including individual receipt labels. */
export type ChatLabelOverrides = Partial<Omit<ChatLabels, "receipt">> & {
  receipt?: Partial<ChatLabels["receipt"]> | undefined;
};

export function resolveLabels(overrides: ChatLabelOverrides | undefined): ChatLabels {
  if (!overrides) return defaultLabels;
  const { receipt, ...rest } = overrides;
  return {
    ...defaultLabels,
    ...withoutUndefined(rest),
    receipt: { ...defaultLabels.receipt, ...withoutUndefined(receipt ?? {}) },
  };
}

function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
