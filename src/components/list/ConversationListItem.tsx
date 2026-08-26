import type { ReactNode } from "react";
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";
import { formatConversationTimestamp } from "../../utils/grouping";
import { Avatar } from "../Avatar";
import { ReadReceipt } from "../ReadReceipt";
import type { ChatConversationSummary } from "../../types";

export interface ConversationListItemProps {
  conversation: ChatConversationSummary;
  onPress?: (() => void) | undefined;
  /**
   * A small badge next to the title — an emoji or flag overlay, e.g. a
   * group icon or a country flag. This package has no icon/emoji picker of
   * its own, so it's a slot, not a prop that only accepts one shape.
   */
  titleBadge?: ReactNode;
  avatarSize?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * One row in `ConversationList` — avatar, title, preview text, timestamp,
 * and an indicator that's either an unread-count badge (`unreadCount > 0`)
 * or a `ReadReceipt` icon (`receiptStatus`, when there's no unread count
 * to show instead) — never both, since they answer different questions
 * ("how many unread" vs. "was my last message seen") and showing both
 * competes for the same small corner of the row.
 */
export function ConversationListItem({ conversation, onPress, titleBadge, avatarSize = 48, style, className }: ConversationListItemProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;
  const { title, avatarUrl, previewText, updatedAt, unreadCount, receiptStatus } = conversation;

  const hasUnread = Boolean(unreadCount && unreadCount > 0);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm }, style]}
      {...classNameProps(className)}
    >
      <Avatar uri={avatarUrl} name={title} size={avatarSize} />
      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.foreground, fontSize: typography.body }]}>
            {title}
          </Text>
          {titleBadge}
        </View>
        {previewText !== undefined && (
          <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: typography.caption }}>
            {previewText}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        <Text style={{ color: colors.mutedForeground, fontSize: typography.timestamp }}>{formatConversationTimestamp(new Date(updatedAt))}</Text>
        {hasUnread ? (
          <View style={[styles.badge, { backgroundColor: colors.accent, borderRadius: radius.full }]}>
            <Text style={{ color: colors.accentForeground, fontSize: typography.timestamp, fontWeight: "700" }}>
              {unreadCount && unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        ) : (
          receiptStatus && <ReadReceipt status={receiptStatus} variant="icon" />
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
  middle: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontWeight: "600",
    flexShrink: 1,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 4,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
