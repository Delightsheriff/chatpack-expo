import { useCallback, useEffect, useRef, type ComponentType } from "react";
import {
  View,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FlashList, type ListRenderItemInfo, type ViewToken } from "@shopify/flash-list";
import type { ClientMessage } from "@chatpack/client";
import { registerNativeWindInterop } from "../../utils/nativewind-interop";
import { useMessageScrollerContext } from "./context";
import { MessageScrollerButton } from "./MessageScrollerButton";

registerNativeWindInterop(FlashList);

export interface MessageItemProps {
  message: ClientMessage;
  /** Chronological neighbors (older/newer), for grouping — pass straight through to `<Message>`. */
  previousMessage?: ClientMessage | undefined;
  nextMessage?: ClientMessage | undefined;
  /** Whether `MessageScrollerProvider`'s `isTurnAnchor` resolved this row as a turn anchor. */
  isAnchor: boolean;
}

export interface MessageScrollerProps {
  /**
   * A component reference, not an inline closure — stable across renders so
   * FlashList doesn't treat every render as a new item type
   * (`list-performance-function-references`, `list-performance-item-memo`).
   */
  ItemComponent: ComponentType<MessageItemProps>;
  /** Fired when the reader scrolls toward older history (the start of the — now non-inverted — list). Wire to your pagination cursor. */
  onLoadOlder?: () => void;
  /** Swap the built-in "↓ Latest" pill for your own — same component-reference pattern as `ItemComponent`. Pass `null` to disable it. */
  ButtonComponent?: ComponentType<{ direction?: "start" | "end" }> | null;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

const LIVE_EDGE_THRESHOLD_PX = 120;
const SCROLLABLE_EPSILON_PX = 4;

/**
 * The styled frame + `FlashList` — corresponds to shadcn's `MessageScroller`
 * (its `MessageScrollerViewport`/`MessageScrollerContent` split doesn't map
 * onto FlashList, which owns its virtualized content directly with no
 * separable inner node — this component covers both roles). Must be used
 * inside a `MessageScrollerProvider`.
 *
 * Turn anchoring: when a new anchor row is appended, scrolls it near the
 * top of the viewport (`scrollToIndex({ viewPosition: 0 })`, offset by
 * `scrollPreviousItemPeek`) rather than just letting the list grow.
 *
 * Live-edge follow: `autoScroll` maps to FlashList v2's
 * `maintainVisibleContentPosition.autoscrollToBottomThreshold`, which
 * already implements "follow only while genuinely at the live edge, release
 * on any scroll away" natively — this component doesn't reimplement that
 * state machine by hand.
 *
 * `preserveScrollOnPrepend` maps to the same `maintainVisibleContentPosition`
 * feature not being disabled, which also covers prepended-history position
 * preservation (its "content added at top" case).
 */
export function MessageScroller({ ItemComponent, onLoadOlder, ButtonComponent = MessageScrollerButton, style, className, testID }: MessageScrollerProps) {
  const {
    listRef,
    messages,
    anchorIndexSet,
    lastAnchorIndex,
    autoScroll,
    scrollPreviousItemPeek,
    defaultScrollPosition,
    preserveScrollOnPrepend,
    visibilityStore,
    scrollableStore,
  } = useMessageScrollerContext();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ClientMessage>) => (
      <ItemComponent message={item} previousMessage={messages[index - 1]} nextMessage={messages[index + 1]} isAnchor={anchorIndexSet.has(index)} />
    ),
    [messages, anchorIndexSet, ItemComponent],
  );

  const keyExtractor = useCallback((item: ClientMessage) => item.id, []);

  // Turn anchoring: scroll when a NEW anchor is appended at the end — not
  // on every render, and not for an anchor that already existed (e.g. a
  // re-render from an unrelated edit elsewhere in the list).
  const previousLastAnchorIndex = useRef(lastAnchorIndex);
  useEffect(() => {
    const isFreshlyAppendedAnchor = lastAnchorIndex >= 0 && lastAnchorIndex === messages.length - 1 && lastAnchorIndex !== previousLastAnchorIndex.current;
    if (isFreshlyAppendedAnchor) {
      void listRef.current?.scrollToIndex({ index: lastAnchorIndex, viewPosition: 0, viewOffset: -scrollPreviousItemPeek, animated: true });
    }
    previousLastAnchorIndex.current = lastAnchorIndex;
  }, [lastAnchorIndex, messages.length, listRef, scrollPreviousItemPeek]);

  // Opening position — applied once, the first time there's data to open on.
  const didApplyInitialPosition = useRef(false);
  useEffect(() => {
    if (didApplyInitialPosition.current || messages.length === 0) return;
    didApplyInitialPosition.current = true;
    if (defaultScrollPosition === "start") {
      listRef.current?.scrollToTop({ animated: false });
    } else if (defaultScrollPosition === "last-anchor" && lastAnchorIndex >= 0) {
      void listRef.current?.scrollToIndex({ index: lastAnchorIndex, viewPosition: 0, viewOffset: -scrollPreviousItemPeek, animated: false });
    }
    // "end": no action needed — a freshly mounted, non-inverted FlashList
    // already renders with the last item as the initial scroll position
    // once content exceeds one screen; for a short conversation "end" and
    // "start" coincide anyway.
  }, [messages.length, defaultScrollPosition, lastAnchorIndex, listRef, scrollPreviousItemPeek]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ClientMessage>[] }) => {
      const visible = viewableItems.filter((token) => token.isViewable);
      const visibleMessageIds = visible.map((token) => token.item.id);
      const topVisibleIndex = visible.reduce<number | null>(
        (min, token) => (token.index !== null && (min === null || token.index < min) ? token.index : min),
        null,
      );
      let currentAnchorId: string | null = null;
      if (topVisibleIndex !== null) {
        for (let i = topVisibleIndex; i >= 0; i -= 1) {
          if (anchorIndexSet.has(i)) {
            currentAnchorId = messages[i]?.id ?? null;
            break;
          }
        }
      }
      visibilityStore.set({ currentAnchorId, visibleMessageIds });
    },
    [anchorIndexSet, messages, visibilityStore],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const atStart = contentOffset.y <= SCROLLABLE_EPSILON_PX;
      const atEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - SCROLLABLE_EPSILON_PX;
      scrollableStore.set({ start: !atStart, end: !atEnd });
    },
    [scrollableStore],
  );

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        testID={testID}
        style={[styles.list, style]}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onStartReached={onLoadOlder}
        onStartReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          disabled: !preserveScrollOnPrepend,
          autoscrollToBottomThreshold: autoScroll ? LIVE_EDGE_THRESHOLD_PX : 0,
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onViewableItemsChanged={handleViewableItemsChanged}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        // @ts-expect-error className registered via cssInterop when nativewind is installed; harmless unknown prop otherwise.
        className={className}
      />
      {ButtonComponent && <ButtonComponent direction="end" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
});
