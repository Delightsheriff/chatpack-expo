import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import type { ChatMessageReference } from "../../types";

export interface BubbleQuoteProps extends SlotProps<"BubbleQuote"> {
  /** Straight from `message.replyTo` */
  replyTo: ChatMessageReference;
  /** Label for original sender */
  senderLabel?: string | undefined;
  /** Jump to the original message */
  onPress?: (() => void) | undefined;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The quoted-parent bar shown at the top of a reply inside a message bubble.
 *
 * Slots: `root`, `sender`, `excerpt`.
 */
export function BubbleQuote({ replyTo, senderLabel, onPress, style, className, styles: slotStyles, classNames }: BubbleQuoteProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const slots = useSlots("BubbleQuote", { styles: slotStyles, classNames }, { deleted: replyTo.deleted, pressed: false });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.bar,
        {
          borderLeftColor: colors.accent,
          backgroundColor: `${colors.accent}14`,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          marginBottom: spacing.xs,
          opacity: pressed ? 0.7 : 1,
        },
        slots.style("root", { pressed }),
        style,
      ]}
      {...slots.className("root", className)}
    >
      <View>
        {senderLabel !== undefined && (
          <Text
            numberOfLines={1}
            style={[{ color: colors.accent, fontSize: typography.caption }, fontStyle(theme, "semibold"), slots.style("sender")]}
            {...slots.className("sender")}
          >
            {senderLabel}
          </Text>
        )}
        <Text
          numberOfLines={1}
          style={[{ color: colors.mutedForeground, fontSize: typography.caption }, fontStyle(theme), slots.style("excerpt")]}
          {...slots.className("excerpt")}
        >
          {replyTo.deleted ? config.labels.quoteDeleted : replyTo.excerpt}
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
