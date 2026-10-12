import type { ReactNode } from "react";
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatComponent, useChatUI } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import { formatConversationTimestamp } from "../../utils/grouping";
import { Avatar } from "../Avatar";
import { ReadReceipt } from "../ReadReceipt";
import { UnreadBadge } from "../UnreadBadge";
import type { ChatConversationSummary } from "../../types";

export interface ConversationListItemProps extends SlotProps<"ConversationListItem"> {
  conversation: ChatConversationSummary;
  onPress?: (() => void) | undefined;
  onLongPress?: (() => void) | undefined;
  /**
   * A small badge next to the title — an emoji or flag overlay, e.g. a
   * group icon or a muted bell.
   */
  titleBadge?: ReactNode;
  /** Replace the avatar for this row (e.g. a presence-dot wrapper). Default: `components.Avatar`. */
  avatar?: ReactNode;
  /** Defaults to `theme.avatar.listSize`. */
  avatarSize?: number;
  /** Format the trailing timestamp. Default: time today, weekday this week, else date. */
  formatTimestamp?: ((date: Date) => string) | undefined;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * One row in `ConversationList` — avatar, title, preview text, timestamp,
 * and an indicator that's either an unread badge (`unreadCount > 0`) or a
 * read receipt (`receiptStatus`) — never both. Unread rows get a bolder
 * title and a foreground-colored preview.
 *
 * Slots: `root`, `body`, `titleRow`, `title`, `preview`, `trailing`,
 * `timestamp`, `badge`, `badgeText` (state: `hasUnread`, `pressed`).
 */
export function ConversationListItem({
  conversation,
  onPress,
  onLongPress,
  titleBadge,
  avatar,
  avatarSize,
  formatTimestamp = formatConversationTimestamp,
  style,
  className,
  styles: slotStyles,
  classNames,
}: ConversationListItemProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, spacing, typography } = theme;
  const AvatarComponent = useChatComponent("Avatar", Avatar);
  const ReadReceiptComponent = useChatComponent("ReadReceipt", ReadReceipt);
  const UnreadBadgeComponent = useChatComponent("UnreadBadge", UnreadBadge);
  const { title, avatarUrl, previewText, updatedAt, unreadCount, receiptStatus } = conversation;

  const hasUnread = Boolean(unreadCount && unreadCount > 0);
  const slots = useSlots("ConversationListItem", { styles: slotStyles, classNames }, { hasUnread, pressed: false });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={
        onLongPress
          ? () => {
              config.haptics("longPress");
              onLongPress();
            }
          : undefined
      }
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, gap: spacing.md },
        pressed && { backgroundColor: colors.surface },
        slots.style("root", { pressed }),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {avatar ?? <AvatarComponent uri={avatarUrl} name={title} size={avatarSize ?? theme.avatar.listSize} />}
      <View style={[styles.body, slots.style("body")]} {...slots.className("body")}>
        <View style={[styles.titleRow, slots.style("titleRow")]} {...slots.className("titleRow")}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.foreground, fontSize: typography.body }, fontStyle(theme, hasUnread ? "bold" : "semibold"), slots.style("title")]}
            {...slots.className("title")}
          >
            {title}
          </Text>
          {titleBadge}
        </View>
        {previewText !== undefined && (
          <Text
            numberOfLines={2}
            style={[
              { color: hasUnread ? colors.foreground : colors.mutedForeground, fontSize: typography.caption + 1 },
              fontStyle(theme),
              slots.style("preview"),
            ]}
            {...slots.className("preview")}
          >
            {previewText}
          </Text>
        )}
      </View>
      <View style={[styles.trailing, slots.style("trailing")]} {...slots.className("trailing")}>
        <Text
          style={[{ color: hasUnread ? colors.accent : colors.mutedForeground, fontSize: typography.timestamp + 1 }, fontStyle(theme), slots.style("timestamp")]}
          {...slots.className("timestamp")}
        >
          {formatTimestamp(new Date(updatedAt))}
        </Text>
        {hasUnread ? (
          <UnreadBadgeComponent count={unreadCount ?? 0} style={slots.style("badge")} textStyle={slots.style("badgeText")} />
        ) : (
          receiptStatus && <ReadReceiptComponent status={receiptStatus} variant="icon" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    flexShrink: 1,
  },
  trailing: {
    alignSelf: "stretch",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 6,
    paddingTop: 2,
  },
});
