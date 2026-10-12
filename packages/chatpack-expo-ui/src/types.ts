/**
 * This package's own message/typing/receipt shapes — deliberately not
 * imported from `@chatpack/client`. Every component only ever used these
 * structurally (every `@chatpack/client` reference in this codebase was a
 * type-only import — nothing here calls into Chatpack's runtime), so the
 * only thing tying this package to Chatpack was a name in an import
 * statement, not an actual dependency. Defining the same shapes locally
 * makes that literal: any backend whose data matches these shapes works
 * with every component here, no `@chatpack/client` install required.
 *
 * These shapes happen to mirror `@chatpack/client`'s `ClientMessage`
 * (`Jsonify<MessageWithDetails>`), `TypingIndicator`, and `ReceiptState`
 * exactly, so a real Chatpack app's data satisfies these types with zero
 * conversion — `ChatMessage` is not a subset, it's the same fields.
 */

export interface ChatReactionSummary {
  /** The reaction key — usually an emoji, but any short string. */
  emoji: string;
  /** How many users reacted with it. */
  count: number;
  /** Who reacted, earliest first. */
  userIds: string[];
}

export interface ChatMessageReference {
  /** The parent message's id. */
  id: string;
  senderId: string;
  /** First ~140 characters of the parent body, truncated with "…"; empty when the parent is a tombstone. */
  excerpt: string;
  deleted: boolean;
}

export interface ChatForwardProvenance {
  /** The message that was copied. */
  messageId: string;
  /** The conversation it was copied out of — the viewer may not have access to it. */
  conversationId: string;
  senderId: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  /** Empty for soft-deleted messages. */
  body: string;
  role: string;
  /** Monotonic per-conversation sort key. */
  seq: number;
  /** ISO 8601. */
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  replyToMessageId: string | null;
  /** Resolved preview of the quoted parent, or `null`. */
  replyTo: ChatMessageReference | null;
  forwardedFromMessageId: string | null;
  forwardedFromConversationId: string | null;
  forwardedFromSenderId: string | null;
  forwardedFrom: ChatForwardProvenance | null;
  /** Reactions grouped by emoji. */
  reactions: ChatReactionSummary[];
  /** User ids mentioned in this message. */
  mentions: string[];
  /** App-defined escape hatch — this package's `attachmentsFromMetadata` reads `metadata.attachments` out of it, by convention. */
  metadata: Record<string, unknown>;
}

export interface ChatTypingIndicator {
  senderId: string;
  /** ISO 8601 — when typing started. */
  at: string;
}

export interface ChatReceiptState {
  /** The highest `seq` known delivered, if any. */
  deliveredSeq?: number;
  /** The id of the last message known read, if any. */
  readMessageId?: string;
}

/**
 * One row's worth of data for `ConversationList` — the chat-list screen
 * (as opposed to `ChatMessage`, which is one row inside a conversation).
 * Deliberately smaller than Chatpack's own `ConversationWithUnread`/
 * `ClientChannelPreview` — only what the built-in `ConversationListItem`
 * actually renders.
 */
export interface ChatConversationSummary {
  id: string;
  title: string;
  avatarUrl?: string;
  previewText?: string;
  /** ISO 8601 — drives the row's timestamp text. */
  updatedAt: string;
  /** Rendered as a count badge when > 0. `undefined`/`0` falls through to `receiptStatus` if present. */
  unreadCount?: number;
  /** Rendered as a `ReadReceipt` icon when there's no unread count to show instead. */
  receiptStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}
