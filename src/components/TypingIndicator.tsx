import { useEffect } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import type { ChatTypingIndicator } from "../types";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export interface TypingIndicatorProps {
  /** `useTyping(chat, { conversationId })`'s return value, straight through — `null` renders nothing. */
  typing: ChatTypingIndicator | null;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function Dot({ delay, color }: { delay: number; color: string }) {
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

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

/**
 * The "someone is composing" bubble — three dots bouncing in sequence,
 * shaped like a received `Bubble` so it sits naturally in a message list.
 * Only `transform` animates (`animation-gpu-properties`).
 *
 * This renders the bubble only; resolving `typing.senderId` to a display
 * name/avatar (if you want one above it) is your app's concern — this
 * component has no user directory to look one up in.
 */
export function TypingIndicator({ typing, style, className }: TypingIndicatorProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing } = state.theme;

  if (!typing) return null;

  return (
    <View
      style={[
        styles.bubble,
        { backgroundColor: colors.bubbleReceived, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
        style,
      ]}
      {...classNameProps(className)}
    >
      <Dot delay={0} color={colors.mutedForeground} />
      <Dot delay={120} color={colors.mutedForeground} />
      <Dot delay={240} color={colors.mutedForeground} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 4,
    marginHorizontal: 12,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
