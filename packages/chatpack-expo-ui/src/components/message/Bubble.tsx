import { useCallback, type ReactNode } from "react";
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import type { ChatTheme } from "../../theme/tokens";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageContext } from "./context";

/**
 * Ports shadcn's seven Bubble variants. `default` here means "the current
 * user's own bubble" (shadcn's own description), not "no variant set" —
 * `Message` picks it automatically from `isOwn` unless overridden.
 */
export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";
export type BubbleAlign = "start" | "end";

export interface BubbleProps extends SlotProps<"Bubble"> {
  /**
   * Defaults to derived from context: `message.role === "system"` →
   * `"muted"`, else `isOwn` → `"default"` : `"secondary"`. Override for
   * anything else — e.g. `"destructive"` for a failed send,
   * `"ghost"` for unframed assistant text spanning the row.
   */
  variant?: BubbleVariant;
  /**
   * Defaults to derived from `isOwn`. shadcn's own guidance: prefer setting
   * alignment on `Message`, not `Bubble` — this override exists for the
   * same rare case as `variant`'s (rendering as if from someone else).
   */
  align?: BubbleAlign;
  children?: ReactNode;
  /**
   * A `BubbleReactions` element, rendered as a sibling overlapping the
   * bubble edge instead of as ordinary content — an explicit slot rather
   * than scanning `children` for one by `displayName`.
   */
  reactions?: ReactNode;
  /**
   * A `BubbleQuote` element, rendered inside the bubble above `children` —
   * the quoted-parent bar for a reply.
   */
  quote?: ReactNode;
  /** Long-press handler (fires the `longPress` haptic first) — this component has no opinion on what happens next. */
  onLongPress?: () => void;
  /** Tap handler, e.g. to toggle a timestamp or open a link. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function bubbleColors(theme: ChatTheme, variant: BubbleVariant) {
  const { colors } = theme;
  switch (variant) {
    case "default":
      return { background: colors.bubbleSent, foreground: colors.bubbleSentForeground, border: undefined };
    case "secondary":
      return { background: colors.bubbleReceived, foreground: colors.bubbleReceivedForeground, border: undefined };
    case "muted":
      return { background: colors.surface, foreground: colors.mutedForeground, border: undefined };
    case "tinted":
      return { background: `${colors.accent}22`, foreground: colors.accent, border: undefined };
    case "outline":
      return { background: "transparent", foreground: colors.foreground, border: colors.border };
    case "ghost":
      return { background: "transparent", foreground: colors.foreground, border: undefined };
    case "destructive":
      return { background: `${colors.destructive}22`, foreground: colors.destructive, border: undefined };
  }
}

/**
 * The message surface — corresponds to shadcn's `Bubble` + `BubbleContent`
 * collapsed into one component. Shape comes from `theme.bubble` (radius,
 * grouped radius, padding); the corners shared with an adjacent grouped
 * bubble use `groupedRadius`, so a run of messages reads as one shape.
 * Anything else — tails, shadows, gradients via a custom child — goes
 * through the slots, whose functions receive grouping/ownership/pressed
 * state.
 *
 * Slots: `container` (outer wrapper, also holds `reactions`), `bubble`
 * (the surface), `text` (the default body text).
 */
export function Bubble({
  variant,
  align,
  children,
  quote,
  reactions,
  onLongPress,
  onPress,
  style,
  className,
  styles: slotStyles,
  classNames,
}: BubbleProps) {
  const { state, config } = useChatUI();
  const { message, isOwn, align: contextAlign, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const theme = state.theme;
  const { typography, bubble } = theme;

  const resolvedVariant: BubbleVariant = variant ?? (message.role === "system" ? "muted" : isOwn ? "default" : "secondary");
  const resolvedAlign: BubbleAlign = align ?? contextAlign;
  const { background, foreground, border } = bubbleColors(theme, resolvedVariant);
  const isGhost = resolvedVariant === "ghost";
  const deleted = message.deletedAt !== null;

  const slots = useSlots("Bubble", { styles: slotStyles, classNames }, {
    isOwn,
    align: contextAlign,
    groupedWithPrevious,
    groupedWithNext,
    variant: resolvedVariant,
    bubbleAlign: resolvedAlign,
    deleted,
    pressed: false,
  });

  const { haptics } = config;
  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;
    haptics("longPress");
    onLongPress();
  }, [haptics, onLongPress]);

  // Flatten the corners shared with an adjacent grouped bubble, so a run of
  // messages from one sender reads as one continuous shape.
  const top = groupedWithPrevious ? bubble.groupedRadius : bubble.radius;
  const bottom = groupedWithNext ? bubble.groupedRadius : bubble.radius;
  const shape: ViewStyle = isGhost
    ? { borderRadius: 0, paddingHorizontal: 0, paddingVertical: 0 }
    : {
        borderRadius: bubble.radius,
        paddingHorizontal: bubble.paddingHorizontal,
        paddingVertical: bubble.paddingVertical,
        ...(resolvedAlign === "end"
          ? { borderTopRightRadius: top, borderBottomRightRadius: bottom }
          : { borderTopLeftRadius: top, borderBottomLeftRadius: bottom }),
      };

  return (
    <View
      style={[
        { alignSelf: resolvedAlign === "end" ? "flex-end" : "flex-start", maxWidth: isGhost ? undefined : "100%" },
        slots.style("container"),
      ]}
      {...slots.className("container")}
    >
      <Pressable
        onLongPress={onLongPress ? handleLongPress : undefined}
        onPress={onPress}
        delayLongPress={300}
        style={({ pressed }) => [
          { backgroundColor: background },
          shape,
          border ? { borderWidth: StyleSheet.hairlineWidth, borderColor: border } : null,
          slots.style("bubble", { pressed }),
          style,
        ]}
        {...slots.className("bubble", className)}
      >
        {quote}
        {children ?? (
          <Text
            style={[
              { color: foreground, fontSize: typography.body },
              fontStyle(theme, "regular"),
              deleted && styles.deleted,
              slots.style("text"),
            ]}
            {...slots.className("text")}
          >
            {deleted ? config.labels.messageDeleted : message.body}
          </Text>
        )}
      </Pressable>
      {reactions}
    </View>
  );
}

const styles = StyleSheet.create({
  deleted: {
    fontStyle: "italic",
    opacity: 0.7,
  },
});
