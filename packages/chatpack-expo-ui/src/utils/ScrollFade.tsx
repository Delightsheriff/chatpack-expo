import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useChatUI } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import type { SlotProps } from "../customization/slots";

export interface ScrollFadeProps extends SlotProps<"ScrollFade"> {
  /** The scrollable content — this only overlays the edge-fade gradients, it doesn't scroll anything itself. */
  children: ReactNode;
  /** Which edges to fade. Defaults to both, matching the horizontal-scroll case (`AttachmentGroup`). */
  edges?: ("start" | "end")[];
  width?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_FADE_WIDTH = 24;

/**
 * Signals "there's more content this way" with an edge gradient instead of
 * a hard clip — corresponds to shadcn's `scroll-fade` utility. Layered
 * over the scrollable content via `position: absolute`, `pointerEvents:
 * "none"` so it never intercepts touches meant for the scroll view
 * underneath.
 */
export function ScrollFade({ children, edges = ["start", "end"], width = DEFAULT_FADE_WIDTH, style, className, styles: slotStyles, classNames }: ScrollFadeProps) {
  const { state } = useChatUI();
  const slots = useSlots("ScrollFade", { styles: slotStyles, classNames }, { edge: "start" });
  const background = state.theme.colors.background;

  return (
    <View
      style={[styles.wrap, slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {children}
      {edges.includes("start") && (
        <LinearGradient
          pointerEvents="none"
          colors={[background, `${background}00`]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fade, styles.start, { width }, slots.style("fade", { edge: "start" })]}
        />
      )}
      {edges.includes("end") && (
        <LinearGradient
          pointerEvents="none"
          colors={[`${background}00`, background]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fade, styles.end, { width }, slots.style("fade", { edge: "end" })]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  fade: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  start: {
    left: 0,
  },
  end: {
    right: 0,
  },
});
