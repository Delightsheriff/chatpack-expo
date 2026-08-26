import { createContext, useContext } from "react";
import type { ClientMessage } from "@chatpack/client";

export interface MessageContextValue {
  message: ClientMessage;
  isOwn: boolean;
  /** Whether the previous/next rendered item is part of the same visual group (`isSameGroup`). */
  groupedWithPrevious: boolean;
  groupedWithNext: boolean;
}

export const MessageContext = createContext<MessageContextValue | null>(null);

/**
 * Exported (not just used internally) so a consumer can build a fully custom
 * message row from scratch — a swapped-in `Bubble` replacement, a new
 * attachment renderer — while still reading `isOwn`/grouping from the same
 * `<Message>` root, instead of re-deriving it.
 */
export function useMessageContext(): MessageContextValue {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error("This component must be rendered inside a <Message> root.");
  }
  return ctx;
}
