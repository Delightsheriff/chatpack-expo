import { Pressable, ScrollView, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatComponent, useChatUI } from "../../context/ChatUIProvider";
import { ChatIcon } from "../../customization/icons";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import { Avatar } from "../Avatar";

export interface ConversationStoryItem {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ConversationStoryRowProps extends SlotProps<"ConversationStoryRow"> {
  items: ConversationStoryItem[];
  onPressItem?: (id: string) => void;
  onPressAdd?: () => void;
  avatarSize?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Horizontal story-style avatars row with an optional Add action.
 *
 * Slots: `root`, `content`, `item`, `name`, `addCircle`, `addLabel`
 * (state: `pressed`).
 */
export function ConversationStoryRow({
  items,
  onPressItem,
  onPressAdd,
  avatarSize = 56,
  style,
  className,
  styles: slotStyles,
  classNames,
}: ConversationStoryRowProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, spacing, typography } = theme;
  const AvatarComponent = useChatComponent("Avatar", Avatar);
  const slots = useSlots("ConversationStoryRow", { styles: slotStyles, classNames }, { pressed: false });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: spacing.lg, gap: spacing.md }, slots.style("content")]}
      style={[slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {onPressAdd && (
        <Pressable
          onPress={onPressAdd}
          accessibilityRole="button"
          accessibilityLabel={config.labels.addStory}
          style={({ pressed }) => [styles.item, slots.style("item", { pressed })]}
          {...slots.className("item")}
        >
          <View
            style={[
              styles.addCircle,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor: colors.border },
              slots.style("addCircle"),
            ]}
            {...slots.className("addCircle")}
          >
            <ChatIcon name="add" size={avatarSize * 0.4} color={colors.mutedForeground} />
          </View>
          <Text style={[{ color: colors.mutedForeground, fontSize: typography.caption }, fontStyle(theme), slots.style("addLabel")]} {...slots.className("addLabel")}>
            {config.labels.addStory}
          </Text>
        </Pressable>
      )}
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem?.(item.id)}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          style={({ pressed }) => [styles.item, slots.style("item", { pressed })]}
          {...slots.className("item")}
        >
          <AvatarComponent uri={item.avatarUrl} name={item.name} size={avatarSize} />
          <Text
            numberOfLines={1}
            style={[{ color: colors.foreground, fontSize: typography.caption, maxWidth: avatarSize + 12 }, fontStyle(theme), slots.style("name")]}
            {...slots.className("name")}
          >
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
