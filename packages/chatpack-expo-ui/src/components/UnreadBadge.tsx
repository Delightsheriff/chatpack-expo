import { Text, View, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useChatConfig, useChatTheme } from "../context/ChatUIProvider";
import { fontStyle } from "../customization/resolveSlots";

export interface UnreadBadgeProps {
  count: number;
  style?: StyleProp<ViewStyle> | undefined;
  textStyle?: StyleProp<TextStyle> | undefined;
}

/**
 * Unread-count pill. Renders nothing at 0. The text comes from
 * `labels.unreadCount` (default caps at `99+`). Replace app-wide with
 * `components={{ UnreadBadge: MyBadge }}`.
 */
export function UnreadBadge({ count, style, textStyle }: UnreadBadgeProps) {
  const theme = useChatTheme();
  const { labels } = useChatConfig();
  if (count <= 0) return null;
  const { colors, radius, typography } = theme;

  return (
    <View style={[styles.badge, { backgroundColor: colors.badge, borderRadius: radius.full }, style]}>
      <Text style={[{ color: colors.badgeForeground, fontSize: typography.timestamp }, fontStyle(theme, "bold"), textStyle]}>
        {labels.unreadCount(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
