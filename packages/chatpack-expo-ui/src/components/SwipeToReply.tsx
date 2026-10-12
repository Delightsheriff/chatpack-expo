import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { useChatUI } from "../context/ChatUIProvider";
import { ChatIcon } from "../customization/icons";
import { useSlots } from "../customization/useSlots";
import type { SlotProps } from "../customization/slots";

export interface SwipeToReplyProps extends SlotProps<"SwipeToReply"> {
  onReply: () => void;
  children: ReactNode;
  /** Horizontal drag distance (px) that commits the reply. */
  threshold?: number;
  /** Which way the row is swiped to reveal the reply icon — `"end"` = the direction the *other* person's messages sit toward, mirrored per RTL by `I18nManager` at the call site if your app supports it. */
  direction?: "start" | "end";
  /** Replace the revealed icon (default: the `reply` icon in a muted circle). */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_THRESHOLD = 64;
const MAX_DRAG_MULTIPLIER = 1.4;

/**
 * Wraps a `<Message>` row (or anything) with a horizontal swipe gesture
 * that reveals a reply icon and calls `onReply` past `threshold` — the
 * iMessage/WhatsApp "swipe to reply" pattern. Only `transform` animates,
 * on the UI thread. The `swipeReply` haptic fires the moment the drag
 * crosses the threshold (not on release), the way native messengers
 * signal "let go now to reply".
 *
 * Requires your app root to be wrapped in `GestureHandlerRootView`.
 *
 * Slots: `root` (the moving row), `icon` (the revealed icon wrapper).
 */
export function SwipeToReply({
  onReply,
  children,
  threshold = DEFAULT_THRESHOLD,
  direction = "end",
  icon,
  style,
  className,
  styles: slotStyles,
  classNames,
}: SwipeToReplyProps) {
  const { state, config } = useChatUI();
  const { colors, radius } = state.theme;
  const slots = useSlots("SwipeToReply", { styles: slotStyles, classNames }, { direction });
  const translateX = useSharedValue(0);
  const crossed = useSharedValue(false);
  const sign = direction === "end" ? 1 : -1;
  const { haptics } = config;
  const fireHaptic = () => haptics("swipeReply");

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event: { translationX: number }) => {
      "worklet";
      const raw = event.translationX * sign;
      const clamped = Math.max(0, Math.min(raw, threshold * MAX_DRAG_MULTIPLIER));
      translateX.value = clamped * sign;
      const isPast = clamped > threshold;
      if (isPast && !crossed.value) runOnJS(fireHaptic)();
      crossed.value = isPast;
    })
    .onEnd(() => {
      "worklet";
      const committed = Math.abs(translateX.value) > threshold;
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      crossed.value = false;
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
        <View
          style={[styles.iconCircle, { backgroundColor: colors.surface, borderRadius: radius.full }, slots.style("icon")]}
          {...slots.className("icon")}
        >
          {icon ?? <ChatIcon name="reply" size={16} color={colors.mutedForeground} />}
        </View>
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[rowStyle, slots.style("root"), style]} {...slots.className("root", className)}>
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
  iconCircle: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
