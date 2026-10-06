import { useCallback, type ComponentType, type ReactElement } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { registerNativeWindInterop } from "../../utils/nativewind-interop";
import { classNameProps } from "../../utils/classNameProps";
import { ConversationListItem } from "./ConversationListItem";
import type { ChatConversationSummary } from "../../types";

registerNativeWindInterop(FlashList);

export interface ConversationListRowProps {
  conversation: ChatConversationSummary;
  onPress?: (() => void) | undefined;
}

export interface ConversationListProps {
  conversations: ChatConversationSummary[];
  onPressConversation?: (id: string) => void;
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
 * Flat virtualized conversation list.
 */
export function ConversationList({
  conversations,
  onPressConversation,
  ItemComponent = ConversationListItem,
  ListHeaderComponent,
  onRefresh,
  refreshing,
  style,
  className,
  testID,
}: ConversationListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatConversationSummary>) => (
      <ItemComponent conversation={item} onPress={onPressConversation ? () => onPressConversation(item.id) : undefined} />
    ),
    [ItemComponent, onPressConversation],
  );

  const keyExtractor = useCallback((item: ChatConversationSummary) => item.id, []);

  return (
    <FlashList
      testID={testID}
      style={[styles.list, style]}
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      onRefresh={onRefresh}
      refreshing={onRefresh ? (refreshing ?? false) : undefined}
      {...classNameProps(className)}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
