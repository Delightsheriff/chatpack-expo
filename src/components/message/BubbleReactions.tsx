import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";

export type BubbleReactionsSide = "top" | "bottom";
export type BubbleReactionsAlign = "start" | "end";

export interface BubbleReactionsProps {
  side?: BubbleReactionsSide;
  align?: BubbleReactionsAlign;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * An overlapping reaction/quick-action row anchored to one edge of the
 * enclosing `Bubble` — `Bubble` detects this as a child by
 * `displayName` and renders it as a sibling positioned over the bubble
 * edge, rather than as ordinary bubble content, matching shadcn's model.
 *
 * Purely presentational, same as shadcn's version — build the row's
 * contents from `message.reactions` yourself (it's a plain
 * `ReactionSummary[]`, no transform needed):
 *
 * ```tsx
 * <Bubble>
 *   {message.reactions.length > 0 && (
 *     <BubbleReactions>
 *       {message.reactions.map((r) => (
 *         <Pressable key={r.emoji} onPress={() => onReact(message.id, r.emoji)}>
 *           <Text>{r.emoji} {r.count}</Text>
 *         </Pressable>
 *       ))}
 *     </BubbleReactions>
 *   )}
 * </Bubble>
 * ```
 */
export function BubbleReactions({ side = "bottom", align = "end", children, style, className }: BubbleReactionsProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing } = state.theme;

  return (
    <View
      style={[
        styles.row,
        side === "top" ? styles.top : styles.bottom,
        { transform: [{ translateY: side === "top" ? -8 : 8 }] },
        align === "start" ? styles.alignStart : styles.alignEnd,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.xs, paddingVertical: 2, gap: 2 },
        style,
      ]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </View>
  );
}

BubbleReactions.displayName = "BubbleReactions";

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  alignStart: {
    left: 8,
  },
  alignEnd: {
    right: 8,
  },
});
