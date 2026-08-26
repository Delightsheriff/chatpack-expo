import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";
import type { ChatMessageReference } from "../../types";

export interface BubbleQuoteProps {
  /** Straight from `message.replyTo` — resolved by the backend per request, so no lookup needed here. */
  replyTo: ChatMessageReference;
  /** This package has no user directory to resolve `replyTo.senderId` into a display name — pass one if you have it. */
  senderLabel?: string;
  /** Jump to the original message — wire to `useMessageScroller().scrollToMessage(replyTo.id)`. Omit to make the quote non-interactive. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The quoted-parent bar shown at the top of a reply — shadcn's own
 * component list names "quoted replies" as a `Bubble` use case; this is
 * that slot, passed to `Bubble`'s `quote` prop the same way `reactions`
 * works (an explicit prop, not children-scanning — same reasoning as the
 * `BubbleReactions` fix: no runtime detection to go stale).
 *
 * Renders "Original message deleted" when `replyTo.deleted` — Chatpack
 * still resolves a preview for a soft-deleted parent (tombstone), it just
 * has no excerpt to show.
 */
export function BubbleQuote({ replyTo, senderLabel, onPress, style, className }: BubbleQuoteProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.bar,
        {
          borderLeftColor: colors.accent,
          backgroundColor: `${colors.accent}14`,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          marginBottom: spacing.xs,
        },
        style,
      ]}
      {...classNameProps(className)}
    >
      <View>
        {senderLabel && (
          <Text numberOfLines={1} style={{ color: colors.accent, fontSize: typography.caption, fontWeight: "600" }}>
            {senderLabel}
          </Text>
        )}
        <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: typography.caption }}>
          {replyTo.deleted ? "Original message deleted" : replyTo.excerpt}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderLeftWidth: 2,
    alignSelf: "stretch",
  },
});
