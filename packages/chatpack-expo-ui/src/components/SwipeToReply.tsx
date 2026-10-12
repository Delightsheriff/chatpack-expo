import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export interface SwipeToReplyProps {
  onReply: () => void;
  children: ReactNode;
  /** Horizontal drag distance (px) that commits the reply. */
  threshold?: number;
  /** Which way the row is swiped to reveal the reply icon — `"end"` = the direction the *other* person's messages sit toward, mirrored per RTL by `I18nManager` at the call site if your app supports it. */
  direction?: "start" | "end";
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_THRESHOLD = 64;
const MAX_DRAG_MULTIPLIER = 1.4;

/**
 * Wraps a `<Message>` row (or anything) with a horizontal swipe gesture
 * that reveals a reply icon and calls `onReply` past `threshold` — the
 * iMessage/WhatsApp "swipe to reply" pattern. Only `transform`
 * (`translateX`) animates, kept on the UI thread via Reanimated's worklets
 * (`animation-gpu-properties`), and the gesture is `Gesture.Pan` from
 * `react-native-gesture-handler`, not the deprecated `PanResponder`
 * (`animation-gesture-detector-press`'s underlying rule: prefer the Gesture
 * API for anything beyond a plain tap).
 *
 * Requires your app root to be wrapped in `GestureHandlerRootView` (from
 * `react-native-gesture-handler`) — this component doesn't do that for
 * you, since it may already be wrapped once at the navigation root.
 *
 * This is a standalone wrapper, not baked into `Message`/`Bubble`, so a
 * message row that doesn't want swipe-to-reply just doesn't get wrapped in
 * it — no `enableSwipe` boolean to thread through the compound components.
 */
export function SwipeToReply({
  onReply,
  children,
  threshold = DEFAULT_THRESHOLD,
  direction = "end",
  style,
  className,
}: SwipeToReplyProps) {
  const { state } = useChatUI();
  const translateX = useSharedValue(0);
  const sign = direction === "end" ? 1 : -1;

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event: any) => {
      "worklet";
      const raw = event.translationX * sign;
      const clamped = Math.max(0, Math.min(raw, threshold * MAX_DRAG_MULTIPLIER));
      translateX.value = clamped * sign;
    })
    .onEnd(() => {
      "worklet";
      const committed = Math.abs(translateX.value) > threshold;
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      if (committed) runOnJS(onReply)();
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(translateX.value) / threshold, 1),
    transform: [{ scale: 0.7 + 0.3 * Math.min(Math.abs(translateX.value) / threshold, 1) }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.icon, direction === "end" ? styles.iconStart : styles.iconEnd, iconStyle]}
        pointerEvents="none"
      >
        <Text style={{ color: state.theme.colors.mutedForeground, fontSize: state.theme.typography.body }}>↩</Text>
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[rowStyle, style]} {...classNameProps(className)}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
  },
  iconStart: {
    left: 12,
  },
  iconEnd: {
    right: 12,
  },
});
