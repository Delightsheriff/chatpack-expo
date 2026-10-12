import { useEffect } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import type { ChatTypingIndicator } from "../types";
import { useChatUI } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import type { SlotProps } from "../customization/slots";

export interface TypingIndicatorProps extends SlotProps<"TypingIndicator"> {
  /** `useTyping(chat, { conversationId })`'s return value, straight through — `null` renders nothing. */
  typing: ChatTypingIndicator | null;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function Dot({ delay, style }: { delay: number; style: StyleProp<ViewStyle> }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]} />;
}

/**
 * The "someone is composing" bubble — three dots bouncing in sequence,
 * shaped like a received `Bubble` (same `theme.bubble` radius/padding) so
 * it sits naturally in a message list. Only `transform` animates.
 *
 * Slots: `root` (the bubble), `dot`.
 */
export function TypingIndicator({ typing, style, className, styles: slotStyles, classNames }: TypingIndicatorProps) {
  const { state } = useChatUI();
  const { colors, bubble, spacing } = state.theme;
  const slots = useSlots("TypingIndicator", { styles: slotStyles, classNames }, {});

  if (!typing) return null;

  const dotStyle = [styles.dot, { backgroundColor: colors.mutedForeground }, slots.style("dot")];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.bubble,
        {
          backgroundColor: colors.bubbleReceived,
          borderRadius: bubble.radius,
          paddingHorizontal: bubble.paddingHorizontal,
          paddingVertical: bubble.paddingVertical + 4,
          marginHorizontal: spacing.md,
          marginTop: spacing.xs,
        },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      <Dot delay={0} style={dotStyle} />
      <Dot delay={120} style={dotStyle} />
      <Dot delay={240} style={dotStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
