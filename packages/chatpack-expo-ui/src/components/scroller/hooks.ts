import { useCallback, useSyncExternalStore } from "react";
import { useMessageScrollerContext, type MessageScrollerVisibilityState, type MessageScrollerScrollableState } from "./context";

/**
 * Local equivalents of FlashList's `ScrollToEdgeParams`/`ScrollToParams` —
 * those types exist only in FlashList's internal `FlashListRef` module and
 * aren't re-exported from its public entry, so this avoids reaching into
 * package internals for a type-only import.
 */
export interface ScrollToEdgeParams {
  animated?: boolean;
}
export interface ScrollToParams extends ScrollToEdgeParams {
  viewPosition?: number;
  viewOffset?: number;
}

export interface UseMessageScrollerResult {
  /**
   * Scrolls to a message by id. Returns `true` if it ran (or was
   * accepted), `false` if the id isn't in the current `messages` array.
   *
   * Platform note: unlike shadcn's web version, this never "queues" a
   * target for a not-yet-mounted row — FlashList's `scrollToIndex` works
   * against the full `messages` array regardless of whether that row is
   * currently rendered on screen (virtualization means "in `messages`" is
   * the only requirement, not "already mounted"), so there's no mount-race
   * to work around here.
   */
  scrollToMessage: (messageId: string, params?: ScrollToParams) => boolean;
  scrollToEnd: (params?: ScrollToEdgeParams) => void;
  scrollToStart: (params?: ScrollToEdgeParams) => void;
}

/** Imperative scroll commands, usable from anywhere inside `MessageScrollerProvider` — a search result, a permalink handler, an outline item — not just from within `MessageScroller` itself. */
export function useMessageScroller(): UseMessageScrollerResult {
  const { listRef, messages, scrollPreviousItemPeek } = useMessageScrollerContext();

  const scrollToMessage = useCallback(
    (messageId: string, params?: ScrollToParams) => {
      const index = messages.findIndex((message) => message.id === messageId);
      if (index === -1) return false;
      void listRef.current?.scrollToIndex({ index, viewPosition: 0, viewOffset: -scrollPreviousItemPeek, animated: true, ...params });
      return true;
    },
    [listRef, messages, scrollPreviousItemPeek],
  );

  const scrollToEnd = useCallback((params?: ScrollToEdgeParams) => listRef.current?.scrollToEnd({ animated: true, ...params }), [listRef]);
  const scrollToStart = useCallback((params?: ScrollToEdgeParams) => listRef.current?.scrollToTop({ animated: true, ...params }), [listRef]);

  return { scrollToMessage, scrollToEnd, scrollToStart };
}

/**
 * Tracks the reader's position — `currentAnchorId` ("where am I", the
 * anchored turn nearest the top of what's visible) and
 * `visibleMessageIds` ("what's on screen", in document order). Backed by
 * `useSyncExternalStore`, so this only re-renders the component that calls
 * it, on scroll/viewability changes — never the transcript itself
 * ("pay for what you use").
 */
export function useMessageScrollerVisibility(): MessageScrollerVisibilityState {
  const { visibilityStore } = useMessageScrollerContext();
  return useSyncExternalStore(visibilityStore.subscribe, visibilityStore.get, visibilityStore.get);
}

/**
 * Which edges the viewport can still scroll toward. "At the start/end" is
 * the negation (`!start` / `!end`); "scrollable at all" is `start || end`.
 */
export function useMessageScrollerScrollable(): MessageScrollerScrollableState {
  const { scrollableStore } = useMessageScrollerContext();
  return useSyncExternalStore(scrollableStore.subscribe, scrollableStore.get, scrollableStore.get);
}
