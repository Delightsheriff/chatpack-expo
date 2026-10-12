import { useEffect } from "react";
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useChatUI } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import type { SlotProps } from "../customization/slots";

export const DEFAULT_QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export interface QuickReactionBarProps extends SlotProps<"QuickReactionBar"> {
  onSelect: (emoji: string) => void;
  emojis?: string[] | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  className?: string | undefined;
  testID?: string;
}

/**
 * A small emoji row for the "hold to react" pattern (iMessage-style) —
 * meant to render inline next to the long-pressed bubble, not inside a full
 * sheet. Fires the `reaction` haptic on pick. Has no opinion on
 * positioning (floating vs. pushing layout), which depends on your row.
 *
 * Slots: `root`, `item` (each emoji's pressable; gets `pressed`), `emoji`.
 */
export function QuickReactionBar({
  onSelect,
  emojis = DEFAULT_QUICK_REACTIONS,
  style,
  className,
  testID,
  styles: slotStyles,
  classNames,
}: QuickReactionBarProps) {
  const { state, config } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;
  const slots = useSlots("QuickReactionBar", { styles: slotStyles, classNames }, { pressed: false });
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    opacity.value = withTiming(1, { duration: 120 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.bar,
        animatedStyle,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full, padding: spacing.xs },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {emojis.map((emoji) => (
        <Pressable
          key={emoji}
          accessibilityRole="button"
          accessibilityLabel={emoji}
          onPress={() => {
            config.haptics("reaction");
            onSelect(emoji);
          }}
          style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 1.2 }] }, slots.style("item", { pressed })]}
          hitSlop={6}
          {...slots.className("item")}
        >
          <Text style={[{ fontSize: typography.emoji }, slots.style("emoji")]} {...slots.className("emoji")}>
            {emoji}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  item: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});
