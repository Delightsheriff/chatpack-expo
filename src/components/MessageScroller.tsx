import { useCallback, useMemo, type ComponentType } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import type { ClientMessage } from "@chatpack/client";

export interface MessageItemProps {
  message: ClientMessage;
  /** Chronological neighbors (older/newer), for grouping — pass straight through to `<Message>`. */
  previousMessage?: ClientMessage | undefined;
  nextMessage?: ClientMessage | undefined;
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
  style?: StyleProp<ViewStyle>;
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
 */
export function MessageScroller({
  messages,
  ItemComponent,
  onLoadOlder,
  style,
  testID,
}: MessageScrollerProps) {
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

  return (
    <FlashList
      testID={testID}
      style={[styles.list, style]}
      data={displayData}
      inverted
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onStartReached={onLoadOlder}
      onStartReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
