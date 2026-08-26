import type { ChatMessage } from "../../types";
import { createRequiredContext } from "../../utils/createRequiredContext";

export type MessageAlign = "start" | "end";

export interface MessageContextValue {
  message: ChatMessage;
  isOwn: boolean;
  /** The alignment `Message` resolved (its `align` prop, or derived from `isOwn`) — read this instead of re-deriving from `isOwn`, so an `align` override on `Message` can't disagree with what `Bubble`/`MessageContent` render. */
  align: MessageAlign;
  /** Whether the previous/next rendered item is part of the same visual group (`isSameGroup`). */
  groupedWithPrevious: boolean;
  groupedWithNext: boolean;
}

/**
 * Exported (not just used internally) so a consumer can build a fully custom
 * message row from scratch — a swapped-in `Bubble` replacement, a new
 * attachment renderer — while still reading `isOwn`/`align`/grouping from
 * the same `<Message>` root, instead of re-deriving it.
 */
export const [MessageContext, useMessageContext] = createRequiredContext<MessageContextValue>("Message");
