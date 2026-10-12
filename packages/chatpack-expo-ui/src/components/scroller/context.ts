import type { RefObject } from "react";
import type { FlashListRef } from "@shopify/flash-list";
import type { ChatMessage } from "../../types";
import type { ExternalStore } from "../../utils/createExternalStore";
import { createRequiredContext } from "../../utils/createRequiredContext";

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
  listRef: RefObject<FlashListRef<ChatMessage> | null>;
  messages: ChatMessage[];
  anchorIndexSet: Set<number>;
  lastAnchorIndex: number;
  visibilityStore: ExternalStore<MessageScrollerVisibilityState>;
  scrollableStore: ExternalStore<MessageScrollerScrollableState>;
}

export const [MessageScrollerContext, useMessageScrollerContext] =
  createRequiredContext<MessageScrollerContextValue>("MessageScrollerProvider");
