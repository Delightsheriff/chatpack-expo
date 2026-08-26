import { useMemo, useRef, type ReactNode } from "react";
import type { FlashListRef } from "@shopify/flash-list";
import type { ChatMessage } from "../../types";
import { useChatUI } from "../../context/ChatUIProvider";
import { createExternalStore } from "../../utils/createExternalStore";
import {
  MessageScrollerContext,
  type DefaultScrollPosition,
  type MessageScrollerVisibilityState,
  type MessageScrollerScrollableState,
} from "./context";

export interface MessageScrollerProviderProps {
  /** Ascending chronological order (oldest first) — same order `useMessages` returns. Unlike the old inverted-list version, this is NOT reversed internally. */
  messages: ChatMessage[];
  /**
   * Which row starts a new turn. Defaults to "the viewer's own messages"
   * (`message.senderId === currentUserId`), matching shadcn's own default
   * demo. Not tied to sender role — anchor a system marker, a "X joined"
   * event, anything that should settle near the top of the viewport when
   * it's the newest thing in the conversation.
   */
  isTurnAnchor?: (message: ChatMessage, index: number, messages: ChatMessage[]) => boolean;
  /** Follow the live edge while streamed/new content grows the list. Default `true`. Maps to FlashList v2's `maintainVisibleContentPosition.autoscrollToBottomThreshold`, which already implements "follow only while at the live edge" natively. */
  autoScroll?: boolean;
  /** Pixels of the previous turn to keep visible above a newly anchored row. Default `0`. */
  scrollPreviousItemPeek?: number;
  /** Where a freshly-mounted transcript opens. Default `"end"`. */
  defaultScrollPosition?: DefaultScrollPosition;
  /** Keep the reader's place when older messages are prepended. Default `true`. Maps to `maintainVisibleContentPosition` not being disabled. */
  preserveScrollOnPrepend?: boolean;
  children: ReactNode;
}

/**
 * The headless scroll-state root — corresponds to shadcn's
 * `MessageScrollerProvider`. Computes which rows are turn anchors once
 * (`useMemo` over `messages`), and owns the imperative `FlashListRef` plus
 * two tiny external stores (visibility, scrollable-edges) that
 * `MessageScroller` writes into from scroll callbacks — so those updates
 * never re-render `messages`/the transcript itself, only whichever hook
 * consumers actually subscribe to them (`useMessageScrollerVisibility`,
 * `useMessageScrollerScrollable`).
 */
export function MessageScrollerProvider({
  messages,
  isTurnAnchor,
  autoScroll = true,
  scrollPreviousItemPeek = 0,
  defaultScrollPosition = "end",
  preserveScrollOnPrepend = true,
  children,
}: MessageScrollerProviderProps) {
  const { state } = useChatUI();
  const resolvedIsTurnAnchor = isTurnAnchor ?? ((message: ChatMessage) => message.senderId === state.currentUserId);

  const { anchorIndexSet, lastAnchorIndex } = useMemo(() => {
    const set = new Set<number>();
    let last = -1;
    messages.forEach((message, index) => {
      if (resolvedIsTurnAnchor(message, index, messages)) {
        set.add(index);
        last = index;
      }
    });
    return { anchorIndexSet: set, lastAnchorIndex: last };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolvedIsTurnAnchor is expected to be referentially stable per the caller's own memoization; re-running per messages change is the actual intent.
  }, [messages]);

  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const visibilityStore = useMemo(
    () => createExternalStore<MessageScrollerVisibilityState>({ currentAnchorId: null, visibleMessageIds: [] }),
    [],
  );
  const scrollableStore = useMemo(() => createExternalStore<MessageScrollerScrollableState>({ start: false, end: false }), []);

  const value = useMemo(
    () => ({
      autoScroll,
      scrollPreviousItemPeek,
      defaultScrollPosition,
      preserveScrollOnPrepend,
      listRef,
      messages,
      anchorIndexSet,
      lastAnchorIndex,
      visibilityStore,
      scrollableStore,
    }),
    [autoScroll, scrollPreviousItemPeek, defaultScrollPosition, preserveScrollOnPrepend, messages, anchorIndexSet, lastAnchorIndex, visibilityStore, scrollableStore],
  );

  return <MessageScrollerContext.Provider value={value}>{children}</MessageScrollerContext.Provider>;
}
