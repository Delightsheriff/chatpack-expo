import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useMessageScroller, useMessageScrollerScrollable } from "./hooks";

export interface MessageScrollerButtonProps {
  /** Which edge this button scrolls to. Default `"end"` (the common "jump to latest" case). */
  direction?: "start" | "end";
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The scroll control — corresponds to shadcn's `MessageScrollerButton`.
 * Scrolls to the start or end of the transcript and goes inert
 * (`accessibilityState.disabled` + `pointerEvents: "none"`, RN's
 * equivalent of the web version's `inert` + `tabIndex={-1}`) when there's
 * nothing to scroll toward in that direction — read from
 * `useMessageScrollerScrollable`, not a local scroll listener of its own.
 */
export function MessageScrollerButton({ direction = "end", style, className }: MessageScrollerButtonProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;
  const { scrollToStart, scrollToEnd } = useMessageScroller();
  const { start, end } = useMessageScrollerScrollable();
  const active = direction === "end" ? end : start;

  return (
    <Pressable
      onPress={direction === "end" ? () => scrollToEnd() : () => scrollToStart()}
      disabled={!active}
      accessibilityRole="button"
      accessibilityState={{ disabled: !active }}
      pointerEvents={active ? "auto" : "none"}
      style={[
        styles.fab,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full, padding: spacing.sm },
        !active && styles.inactive,
        style,
      ]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      <Text style={{ color: colors.foreground, fontSize: typography.caption }}>{direction === "end" ? "↓ Latest" : "↑ Start"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    alignSelf: "center",
    bottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inactive: {
    opacity: 0,
  },
});
