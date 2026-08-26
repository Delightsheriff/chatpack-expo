import { useEffect } from "react";
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useChatUI } from "../context/ChatUIProvider";
import { DEFAULT_QUICK_REACTIONS } from "./MessageActionsSheet";

export interface QuickReactionBarProps {
  onSelect: (emoji: string) => void;
  emojis?: string[] | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  className?: string | undefined;
  testID?: string;
}

/**
 * A small emoji row for the "hold to react" pattern (iMessage-style),
 * distinct from `MessageActionsSheet`'s reaction row: this is meant to
 * render inline, right next to the bubble that was long-pressed, not
 * inside a full sheet — pick whichever fits your app, or both.
 *
 * This component only renders the row and calls `onSelect`; it has no
 * opinion on *positioning* (floating over the bubble vs. pushing layout)
 * because that depends on your message row's own layout — see the README
 * for the inline-anchored pattern this was built against. Wanting true
 * floating-over-content positioning is a sign to add a measure/portal
 * layer in your app, not something this component tries to guess at.
 */
export function QuickReactionBar({
  onSelect,
  emojis = DEFAULT_QUICK_REACTIONS,
  style,
  className,
  testID,
}: QuickReactionBarProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing } = state.theme;
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
        style,
      ]}
      // @ts-expect-error forwarded for NativeWind's cssInterop when the host app has the babel/metro transform active; harmless unknown prop otherwise.
      className={className}
    >
      {emojis.map((emoji) => (
        <Pressable key={emoji} onPress={() => onSelect(emoji)} style={styles.item} hitSlop={6}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
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
