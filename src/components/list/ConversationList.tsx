import { useCallback, type ComponentType, type ReactElement } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { registerNativeWindInterop } from "../../utils/nativewind-interop";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { ConversationListItem } from "./ConversationListItem";
import type { ChatConversationSummary } from "../../types";

registerNativeWindInterop(FlashList);

export interface ConversationListRowProps {
  conversation: ChatConversationSummary;
  onPress?: (() => void) | undefined;
  onLongPress?: (() => void) | undefined;
}

export interface ConversationListProps extends SlotProps<"ConversationList"> {
  conversations: ChatConversationSummary[];
  onPressConversation?: (id: string) => void;
  /** Long-press a row (fires the `longPress` haptic) — e.g. open a pin/mute/delete menu. */
  onLongPressConversation?: (id: string) => void;
  /** Shown when `conversations` is empty. */
  ListEmptyComponent?: ReactElement;
  /**
   * Component reference for rendering each row. Defaults to ConversationListItem.
   */
  ItemComponent?: ComponentType<ConversationListRowProps>;
  ListHeaderComponent?: ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/**
 * Virtualized conversation list (FlashList). On a native stack, set
 * `contentInsetAdjustmentBehavior="automatic"` — the default here — so it
 * scrolls under a large title and a header search bar correctly.
 *
 * Slots: `root`.
 */
export function ConversationList({
  conversations,
  onPressConversation,
  onLongPressConversation,
  ListEmptyComponent,
  ItemComponent = ConversationListItem,
  ListHeaderComponent,
  onRefresh,
  refreshing,
  style,
  className,
  testID,
  styles: slotStyles,
  classNames,
}: ConversationListProps) {
  const slots = useSlots("ConversationList", { styles: slotStyles, classNames }, {});
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatConversationSummary>) => (
      <ItemComponent
        conversation={item}
        onPress={onPressConversation ? () => onPressConversation(item.id) : undefined}
        onLongPress={onLongPressConversation ? () => onLongPressConversation(item.id) : undefined}
      />
    ),
    [ItemComponent, onPressConversation, onLongPressConversation],
  );

  const keyExtractor = useCallback((item: ChatConversationSummary) => item.id, []);

  return (
    <FlashList
      testID={testID}
      style={[styles.list, slots.style("root"), style]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={ListEmptyComponent}
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      onRefresh={onRefresh}
      refreshing={onRefresh ? (refreshing ?? false) : undefined}
      {...slots.className("root", className)}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
