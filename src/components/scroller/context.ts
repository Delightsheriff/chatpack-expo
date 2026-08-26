import { createContext, useContext, type RefObject } from "react";
import type { FlashListRef } from "@shopify/flash-list";
import type { ClientMessage } from "@chatpack/client";
import type { ExternalStore } from "../../utils/createExternalStore";

export type DefaultScrollPosition = "start" | "end" | "last-anchor";

export interface MessageScrollerVisibilityState {
  currentAnchorId: string | null;
  visibleMessageIds: string[];
}

export interface MessageScrollerScrollableState {
  start: boolean;
  end: boolean;
}

export interface MessageScrollerContextValue {
  autoScroll: boolean;
  scrollPreviousItemPeek: number;
  defaultScrollPosition: DefaultScrollPosition;
  preserveScrollOnPrepend: boolean;
  listRef: RefObject<FlashListRef<ClientMessage> | null>;
  messages: ClientMessage[];
  anchorIndexSet: Set<number>;
  lastAnchorIndex: number;
  visibilityStore: ExternalStore<MessageScrollerVisibilityState>;
  scrollableStore: ExternalStore<MessageScrollerScrollableState>;
}

export const MessageScrollerContext = createContext<MessageScrollerContextValue | null>(null);

export function useMessageScrollerContext(): MessageScrollerContextValue {
  const ctx = useContext(MessageScrollerContext);
  if (!ctx) {
    throw new Error("This must be used within a <MessageScrollerProvider>.");
  }
  return ctx;
}
