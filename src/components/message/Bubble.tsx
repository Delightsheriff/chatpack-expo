import { Children, isValidElement, type ReactNode } from "react";
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import type { ChatTheme } from "../../theme/tokens";
import { useMessageContext } from "./context";

/**
 * Ports shadcn's seven Bubble variants. `default` here means "the current
 * user's own bubble" (shadcn's own description), not "no variant set" —
 * `Message` picks it automatically from `isOwn` unless overridden.
 */
export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";
export type BubbleAlign = "start" | "end";

export interface BubbleProps {
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
  /** Long-press handler — this component has no opinion on what happens next (open a menu, a sheet, nothing). */
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function bubbleColors(theme: ChatTheme, variant: BubbleVariant) {
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
 * A bubble sizes to its content up to 80% of the row width, except
 * `"ghost"`, which drops the max-width so assistant text/rich content can
 * span the full row — matching shadcn's own note on the variant.
 */
const MAX_WIDTH_PERCENT = "80%";

function isReactionsChild(child: ReactNode): boolean {
  return isValidElement(child) && (child.type as { displayName?: string })?.displayName === "BubbleReactions";
}

/**
 * The message surface — corresponds to shadcn's `Bubble` + `BubbleContent`
 * collapsed into one component (RN has no separate polymorphic-`render`
 * concept the way the web version does; wrap `Bubble` in your own
 * `Pressable`/`Link` if you need bubble-as-button/link semantics beyond
 * `onLongPress`).
 *
 * A `BubbleReactions` child is detected and rendered as an overlapping
 * pill row per shadcn's model; every other child renders as ordinary
 * bubble content.
 */
export function Bubble({ variant, align, children, onLongPress, style, className }: BubbleProps) {
  const { state } = useChatUI();
  const { message, isOwn, align: contextAlign, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const { radius, spacing, typography } = state.theme;

  const resolvedVariant: BubbleVariant = variant ?? (message.role === "system" ? "muted" : isOwn ? "default" : "secondary");
  const resolvedAlign: BubbleAlign = align ?? contextAlign;
  const { background, foreground, border } = bubbleColors(state.theme, resolvedVariant);
  const isGhost = resolvedVariant === "ghost";

  const childArray = Children.toArray(children);
  const reactions = childArray.filter(isReactionsChild);
  const content = childArray.filter((child) => !isReactionsChild(child));

  return (
    <View style={styles.wrap}>
      <Pressable
        onLongPress={onLongPress}
        style={[
          styles.bubble,
          !isGhost && { maxWidth: MAX_WIDTH_PERCENT },
          {
            backgroundColor: background,
            borderRadius: isGhost ? 0 : radius.lg,
            paddingHorizontal: isGhost ? 0 : spacing.md,
            paddingVertical: isGhost ? 0 : spacing.sm,
            ...(border ? { borderWidth: StyleSheet.hairlineWidth, borderColor: border } : null),
            // Flatten the corner shared with an adjacent grouped bubble, so a
            // run of messages from one sender reads as one continuous shape.
            ...(!isGhost && resolvedAlign === "end"
              ? { borderTopRightRadius: groupedWithPrevious ? radius.sm : radius.lg, borderBottomRightRadius: groupedWithNext ? radius.sm : radius.lg }
              : !isGhost
                ? { borderTopLeftRadius: groupedWithPrevious ? radius.sm : radius.lg, borderBottomLeftRadius: groupedWithNext ? radius.sm : radius.lg }
                : null),
          },
          style,
        ]}
        // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
        className={className}
      >
        {content.length > 0 ? (
          content
        ) : (
          <Text style={{ color: foreground, fontSize: typography.body }}>{message.deletedAt ? "Message deleted" : message.body}</Text>
        )}
      </Pressable>
      {reactions}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
  },
  bubble: {
    alignSelf: "flex-start",
  },
});
