import { Fragment, type ReactNode } from "react";
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useMessageContext } from "./context";

export type BubbleVariant = "sent" | "received" | "system";

export interface BubbleProps {
  /**
   * Override the variant this bubble renders as. Defaults to derived from
   * context (`message.role === "system"` → `"system"`, else `isOwn` →
   * `"sent"`/`"received"`) — an explicit override rather than a boolean,
   * per `patterns-explicit-variants`, for the rare case an app wants to
   * render someone else's message as if it were the viewer's own (e.g. a
   * moderation preview).
   */
  variant?: BubbleVariant;
  children?: ReactNode;
  /** Long-press handler — this component has no opinion on what happens next (open a menu, a sheet, nothing). */
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The message surface: bubble chrome, body text (when `children` is
 * omitted), and a reaction row read straight off `message.reactions`.
 * Corresponds to shadcn's `Bubble` — variants, reactions, and a
 * long-press affordance are all it owns; grouping/alignment stay in the
 * `Message` root, attachments stay in `Attachment`.
 */
export function Bubble({ variant, children, onLongPress, style, className }: BubbleProps) {
  const { state, actions } = useChatUI();
  const { message, isOwn, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const { colors, radius, spacing, typography } = state.theme;

  const resolvedVariant: BubbleVariant = variant ?? (message.role === "system" ? "system" : isOwn ? "sent" : "received");

  if (resolvedVariant === "system") {
    return (
      <View style={[styles.systemRow, style]}>
        <Text style={{ color: colors.mutedForeground, fontSize: typography.caption }}>{message.body}</Text>
      </View>
    );
  }

  const isSent = resolvedVariant === "sent";
  const backgroundColor = isSent ? colors.bubbleSent : colors.bubbleReceived;
  const textColor = isSent ? colors.bubbleSentForeground : colors.bubbleReceivedForeground;

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[
        styles.bubble,
        {
          backgroundColor,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          // Flatten the corner shared with an adjacent grouped bubble, so a
          // run of messages from one sender reads as one continuous shape.
          ...(isSent
            ? { borderTopRightRadius: groupedWithPrevious ? radius.sm : radius.lg, borderBottomRightRadius: groupedWithNext ? radius.sm : radius.lg }
            : { borderTopLeftRadius: groupedWithPrevious ? radius.sm : radius.lg, borderBottomLeftRadius: groupedWithNext ? radius.sm : radius.lg }),
        },
        style,
      ]}
      // @ts-expect-error forwarded for NativeWind's cssInterop when the host app has the babel/metro transform active; harmless unknown prop otherwise.
      className={className}
    >
      {children ?? <Text style={{ color: textColor, fontSize: typography.body }}>{message.deletedAt ? "Message deleted" : message.body}</Text>}
      {message.reactions.length > 0 && (
        <View style={[styles.reactionRow, { marginTop: spacing.xs }]}>
          {message.reactions.map((reaction) => (
            <Fragment key={reaction.emoji}>
              <Pressable
                onPress={() => actions.onReact?.(message.id, reaction.emoji)}
                style={[
                  styles.reactionChip,
                  { backgroundColor: colors.surface, borderRadius: radius.full, borderColor: colors.border },
                ]}
              >
                <Text style={{ fontSize: typography.caption, color: colors.foreground }}>
                  {reaction.emoji} {reaction.count}
                </Text>
              </Pressable>
            </Fragment>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  systemRow: {
    alignSelf: "center",
    paddingVertical: 4,
  },
  bubble: {
    maxWidth: "78%",
  },
  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  reactionChip: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
