import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ChatIcon } from "../../customization/icons";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageScroller, useMessageScrollerScrollable } from "./hooks";

export interface MessageScrollerButtonProps extends SlotProps<"MessageScrollerButton"> {
  /** Which edge this button scrolls to. Default `"end"` (the common "jump to latest" case). */
  direction?: "start" | "end";
  /** Show the label next to the chevron. Default `false` — a round icon button, as in native messengers. */
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The scroll control — corresponds to shadcn's `MessageScrollerButton`.
 * Scrolls to the start or end of the transcript and goes inert
 * (`accessibilityState.disabled` + `pointerEvents: "none"`) when there's
 * nothing to scroll toward in that direction — read from
 * `useMessageScrollerScrollable`, not a local scroll listener of its own.
 *
 * Slots: `root`, `label` (state: `direction`, `active`, `pressed`).
 * Replace app-wide with `components={{ ScrollButton: MyButton }}`.
 */
export function MessageScrollerButton({ direction = "end", showLabel = false, style, className, styles: slotStyles, classNames }: MessageScrollerButtonProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const { scrollToStart, scrollToEnd } = useMessageScroller();
  const { start, end } = useMessageScrollerScrollable();
  const active = direction === "end" ? end : start;
  const slots = useSlots("MessageScrollerButton", { styles: slotStyles, classNames }, { direction, active, pressed: false });
  const label = direction === "end" ? config.labels.jumpToLatest : config.labels.jumpToStart;

  return (
    <Pressable
      onPress={direction === "end" ? () => scrollToEnd() : () => scrollToStart()}
      disabled={!active}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !active }}
      pointerEvents={active ? "auto" : "none"}
      style={({ pressed }) => [
        styles.fab,
        direction === "end" ? styles.bottom : styles.top,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radius.full,
          padding: spacing.sm,
          gap: spacing.xs,
          opacity: active ? (pressed ? 0.7 : 1) : 0,
        },
        slots.style("root", { pressed }),
        style,
      ]}
      {...slots.className("root", className)}
    >
      <ChatIcon name={direction === "end" ? "chevronDown" : "chevronUp"} size={18} color={colors.foreground} />
      {showLabel && (
        <Text style={[{ color: colors.foreground, fontSize: typography.caption }, fontStyle(theme, "medium"), slots.style("label")]} {...slots.className("label")}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bottom: {
    bottom: 12,
  },
  top: {
    top: 12,
  },
});
