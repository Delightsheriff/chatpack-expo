import { Pressable, ScrollView, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";
import { Avatar } from "../Avatar";

export interface ConversationStoryItem {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ConversationStoryRowProps {
  items: ConversationStoryItem[];
  onPressItem?: (id: string) => void;
  /** Renders a dashed "add" circle first when provided. */
  onPressAdd?: () => void;
  avatarSize?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The horizontal quick-access row above a chat list — a dashed "add"
 * circle, then avatars with names below, story-style. Purely a fast way
 * to jump into a conversation; it has no unread/online-ring state of its
 * own to avoid guessing at a presence model your backend may not have —
 * layer that on with your own overlay if you need it (`style`/`className`
 * on `ConversationListItem`'s sibling here won't help; wrap each item's
 * `Avatar` yourself if you need a presence dot).
 */
export function ConversationStoryRow({ items, onPressItem, onPressAdd, avatarSize = 56, style, className }: ConversationStoryRowProps) {
  const { state } = useChatUI();
  const { colors, spacing, typography } = state.theme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: spacing.md, gap: spacing.md }]}
      style={style}
      {...classNameProps(className)}
    >
      {onPressAdd && (
        <Pressable onPress={onPressAdd} style={styles.item}>
          <View
            style={[
              styles.addCircle,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor: colors.border },
            ]}
          >
            <Ionicons name="add" size={avatarSize * 0.4} color={colors.mutedForeground} />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: typography.caption }}>Add</Text>
        </Pressable>
      )}
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => onPressItem?.(item.id)} style={styles.item}>
          <Avatar uri={item.avatarUrl} name={item.name} size={avatarSize} />
          <Text numberOfLines={1} style={{ color: colors.foreground, fontSize: typography.caption, maxWidth: avatarSize + 12 }}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  item: {
    alignItems: "center",
    gap: 4,
  },
  addCircle: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
