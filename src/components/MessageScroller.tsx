import { useCallback, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FlashList, type FlashListRef, type ListRenderItemInfo } from "@shopify/flash-list";
import type { ClientMessage } from "@chatpack/client";
import { useChatUI } from "../context/ChatUIProvider";
import { registerNativeWindInterop } from "../utils/nativewind-interop";

// FlashList isn't one of NativeWind's auto-patched core components — this
// registers `className` support for it if (and only if) `nativewind` is
// installed. See `registerNativeWindInterop`'s own doc comment.
registerNativeWindInterop(FlashList);

export interface MessageItemProps {
  message: ClientMessage;
  /** Chronological neighbors (older/newer), for grouping — pass straight through to `<Message>`. */
  previousMessage?: ClientMessage | undefined;
  nextMessage?: ClientMessage | undefined;
}

export interface ScrollToLatestButtonProps {
  onPress: () => void;
}

const NEAR_LATEST_THRESHOLD_PX = 120;

function DefaultScrollToLatestButton({ onPress }: ScrollToLatestButtonProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fab,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full, padding: spacing.sm },
      ]}
    >
      <Text style={{ color: colors.foreground, fontSize: typography.caption }}>↓ Latest</Text>
    </Pressable>
  );
}

export interface MessageScrollerProps {
  /** Ascending chronological order (oldest first) — same order `useMessages` returns. */
  messages: ClientMessage[];
  /**
   * A component reference, not an inline closure — stable across renders so
   * FlashList doesn't treat every render as a new item type
   * (`list-performance-function-references`, `list-performance-item-memo`).
   * Typically `Message.Bubble`/`Message.Attachment` composed inside your own
   * memoized row component; see the package README for a full example.
   */
  ItemComponent: ComponentType<MessageItemProps>;
  /** Fired when the user scrolls toward older history (top of an inverted chat list). Wire to your pagination cursor. */
  onLoadOlder?: () => void;
  /**
   * Swap the built-in "↓ Latest" pill for your own — a component reference,
   * same reasoning as `ItemComponent`. Pass `null` to disable the feature
   * entirely rather than rendering an empty one.
   */
  ScrollToLatestButtonComponent?: ComponentType<ScrollToLatestButtonProps> | null;
  style?: StyleProp<ViewStyle>;
  /** Forwarded to the underlying `FlashList` via NativeWind's `cssInterop`, when `nativewind` is installed. */
  className?: string;
  testID?: string;
}

/**
 * Virtualized, inverted message list — corresponds to shadcn's
 * `MessageScroller`. Built on FlashList (`list-performance-virtualize`),
 * never `FlatList`/`ScrollView`, since chat history is exactly the
 * frequent-insert, unbounded-length case FlashList exists for.
 *
 * Renders newest-at-bottom by inverting the list and reversing the data,
 * while still handing each item its *chronological* neighbors so grouping
 * (`isSameGroup`) reads naturally regardless of render order.
 *
 * Also owns "scroll to latest": when the user has scrolled up (into
 * history) and a `↓ Latest` button appears, tapping it (or a new message
 * arriving while already near the bottom) jumps back to the newest message.
 * This is the one piece of behavior this package attaches to the list
 * itself, rather than leaving to the composing app, because it needs the
 * list's own scroll offset — nothing about it is Chatpack-specific.
 */
export function MessageScroller({
  messages,
  ItemComponent,
  onLoadOlder,
  ScrollToLatestButtonComponent = DefaultScrollToLatestButton,
  style,
  className,
  testID,
}: MessageScrollerProps) {
  const listRef = useRef<FlashListRef<ClientMessage>>(null);
  const [isNearLatest, setIsNearLatest] = useState(true);

  // Newest first, to pair with `inverted` — FlashList's own convention for chat UIs.
  const displayData = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ClientMessage>) => {
      const chronologicalIndex = messages.length - 1 - index;
      return (
        <ItemComponent
          message={item}
          previousMessage={messages[chronologicalIndex - 1]}
          nextMessage={messages[chronologicalIndex + 1]}
        />
      );
    },
    [messages, ItemComponent],
  );

  const keyExtractor = useCallback((item: ClientMessage) => item.id, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsNearLatest(event.nativeEvent.contentOffset.y <= NEAR_LATEST_THRESHOLD_PX);
  }, []);

  const scrollToLatest = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        testID={testID}
        style={[styles.list, style]}
        data={displayData}
        inverted
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onStartReached={onLoadOlder}
        onStartReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        // @ts-expect-error className registered via cssInterop when nativewind is installed; harmless unknown prop otherwise.
        className={className}
      />
      {!isNearLatest && ScrollToLatestButtonComponent && <ScrollToLatestButtonComponent onPress={scrollToLatest} />}
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
  fab: {
    position: "absolute",
    alignSelf: "center",
    bottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
