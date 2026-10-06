import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";
import type { ChatMessageReference } from "../../types";

export interface BubbleQuoteProps {
  /** Straight from `message.replyTo` */
  replyTo: ChatMessageReference;
  /** Label for original sender */
  senderLabel?: string;
  /** Jump to the original message */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The quoted-parent bar shown at the top of a reply inside a message bubble.
 */
export function BubbleQuote({ replyTo, senderLabel, onPress, style, className }: BubbleQuoteProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.bar,
        {
          borderLeftColor: colors.accent,
          backgroundColor: `${colors.accent}14`,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          marginBottom: spacing.xs,
        },
        style,
      ]}
      {...classNameProps(className)}
    >
      <View>
        {senderLabel && (
          <Text numberOfLines={1} style={{ color: colors.accent, fontSize: typography.caption, fontWeight: "600" }}>
            {senderLabel}
          </Text>
        )}
        <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: typography.caption }}>
          {replyTo.deleted ? "Original message deleted" : replyTo.excerpt}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderLeftWidth: 2,
    alignSelf: "stretch",
  },
});
