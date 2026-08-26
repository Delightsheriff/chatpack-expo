import { useEffect } from "react";
import type { StyleProp, TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface ShimmerTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * Text with a pulsing-opacity "live status" effect (streaming state,
 * "Connecting…"). Animates `opacity` only — never layout or color
 * properties — so it stays on the UI thread (`animation-gpu-properties`).
 */
export function ShimmerText({ children, style, testID }: ShimmerTextProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text testID={testID} style={[animatedStyle, style]}>
      {children}
    </Animated.Text>
  );
}
