import { useCallback, useEffect, useRef, type ComponentType, type ReactElement } from "react";
import {
  View,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FlashList, type ListRenderItemInfo, type ViewToken } from "@shopify/flash-list";
import type { ChatMessage } from "../../types";
import { registerNativeWindInterop } from "../../utils/nativewind-interop";
import { useChatComponent } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { ChatKeyboardScrollView, useChatKeyboard } from "../ChatKeyboardView";
import { useMessageScrollerContext } from "./context";
import { MessageScrollerButton, type MessageScrollerButtonProps } from "./MessageScrollerButton";

registerNativeWindInterop(FlashList);

export interface MessageItemProps {
  message: ChatMessage;
  /** Chronological neighbors (older/newer), for grouping — pass straight through to `<Message>`. */
  previousMessage?: ChatMessage | undefined;
  nextMessage?: ChatMessage | undefined;
  /** Whether `MessageScrollerProvider`'s `isTurnAnchor` resolved this row as a turn anchor. */
  isAnchor: boolean;
}

export interface MessageScrollerProps extends SlotProps<"MessageScroller"> {
  /**
   * A component reference, not an inline closure — stable across renders so
   * FlashList doesn't treat every render as a new item type
   * (`list-performance-function-references`, `list-performance-item-memo`).
   */
  ItemComponent: ComponentType<MessageItemProps>;
  /** Fired when the reader scrolls toward older history (the start of the — now non-inverted — list). Wire to your pagination cursor. */
  onLoadOlder?: () => void;
  /** Swap the built-in jump-to-latest button for your own (or set `components.ScrollButton` app-wide). Pass `null` to disable it. */
  ButtonComponent?: ComponentType<MessageScrollerButtonProps> | null;
  /** Rendered above the oldest message — e.g. a "loading older" spinner or a conversation intro. */
  ListHeaderComponent?: ReactElement | null;
  /** Rendered below the newest message — e.g. a `TypingIndicator` that scrolls with the transcript. */
  ListFooterComponent?: ReactElement | null;
  /**
   * Scroll component for the underlying FlashList. Inside a
   * `ChatKeyboardView` (chat mode) this defaults to `ChatKeyboardScrollView`
   * — content lifts with the keyboard and the list swipes it away
   * interactively. Outside one, the plain ScrollView.
   */
  renderScrollComponent?: ComponentType<ScrollViewProps> | undefined;
  /** FlashList `drawDistance`. Default 500 — extra rows rendered off-screen so keyboard lifts don't reveal blank space. */
  drawDistance?: number | undefined;
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
export function MessageScroller({
  ItemComponent,
  onLoadOlder,
  ButtonComponent,
  ListHeaderComponent,
  ListFooterComponent,
  renderScrollComponent,
  drawDistance = 500,
  style,
  className,
  testID,
  styles: slotStyles,
  classNames,
}: MessageScrollerProps) {
  const keyboard = useChatKeyboard();
  const DefaultButton = useChatComponent("ScrollButton", MessageScrollerButton);
  const ResolvedButton = ButtonComponent === undefined ? DefaultButton : ButtonComponent;
  const scrollComponent = renderScrollComponent ?? (keyboard?.mode === "chat" ? ChatKeyboardScrollView : undefined);
  const slots = useSlots("MessageScroller", { styles: slotStyles, classNames }, {});
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
    ({ item, index }: ListRenderItemInfo<ChatMessage>) => (
      <ItemComponent message={item} previousMessage={messages[index - 1]} nextMessage={messages[index + 1]} isAnchor={anchorIndexSet.has(index)} />
    ),
    [messages, anchorIndexSet, ItemComponent],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // Turn anchoring / live-edge scrolling: scroll when a new message is appended at the end
  const previousMessageCount = useRef(messages.length);
  const previousLastAnchorIndex = useRef(lastAnchorIndex);
  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      if (defaultScrollPosition === "end" || autoScroll) {
        // In mobile messengers, newly sent/received messages sit at the live bottom edge
        void listRef.current?.scrollToEnd({ animated: true });
      } else if (lastAnchorIndex >= 0 && lastAnchorIndex === messages.length - 1 && lastAnchorIndex !== previousLastAnchorIndex.current) {
        void listRef.current?.scrollToIndex({ index: lastAnchorIndex, viewPosition: 0, viewOffset: -scrollPreviousItemPeek, animated: true });
      }
    }
    previousMessageCount.current = messages.length;
    previousLastAnchorIndex.current = lastAnchorIndex;
  }, [lastAnchorIndex, messages.length, listRef, scrollPreviousItemPeek, autoScroll, defaultScrollPosition]);

  // Opening position — applied once, the first time there's data to open on.
  const didApplyInitialPosition = useRef(false);
  useEffect(() => {
    if (didApplyInitialPosition.current || messages.length === 0) return;
    didApplyInitialPosition.current = true;
    if (defaultScrollPosition === "start") {
      listRef.current?.scrollToTop({ animated: false });
    } else if (defaultScrollPosition === "last-anchor" && lastAnchorIndex >= 0) {
      void listRef.current?.scrollToIndex({ index: lastAnchorIndex, viewPosition: 0, viewOffset: -scrollPreviousItemPeek, animated: false });
    } else if (defaultScrollPosition === "end") {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [messages.length, defaultScrollPosition, lastAnchorIndex, listRef, scrollPreviousItemPeek]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ChatMessage>[] }) => {
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
    <View style={[styles.container, slots.style("root")]} {...slots.className("root")}>
      <FlashList
        ref={listRef}
        testID={testID}
        style={[styles.list, slots.style("list"), style]}
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
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        drawDistance={drawDistance}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        {...(scrollComponent ? { renderScrollComponent: scrollComponent } : null)}
        {...slots.className("list", className)}
      />
      {ResolvedButton && <ResolvedButton direction="end" />}
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
