import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useMessageAvatarAlignment } from "./avatar-alignment";
import { useMessageContext } from "./context";

export interface MessageAvatarProps {
  children: ReactNode;
  /**
   * Force this avatar to render visibly even mid-group. Defaults to
   * `!groupedWithNext` — a message with more of the same sender's messages
   * below it renders an invisible, space-reserving avatar instead (per
   * shadcn's `MessageGroup` guidance: "render an empty MessageAvatar on the
   * earlier messages to keep them aligned with the avatar on the last one").
   */
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const AVATAR_SLOT_SIZE = 32;

/**
 * The avatar slot — corresponds to shadcn's `MessageAvatar`. Bottom-anchors
 * to the row by default (via `Message`'s `alignItems: "flex-end"`), then
 * shifts up by the sibling `MessageFooter`'s measured height so it stays
 * aligned with the bubble surface rather than the footer, matching
 * shadcn's own behavior.
 */
export function MessageAvatar({ children, visible, style, className }: MessageAvatarProps) {
  const { groupedWithNext } = useMessageContext();
  const { footerHeight } = useMessageAvatarAlignment();
  const isVisible = visible ?? !groupedWithNext;

  return (
    <View
      style={[
        styles.slot,
        { marginBottom: footerHeight },
        !isVisible && styles.hidden,
        style,
      ]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {isVisible && children}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: AVATAR_SLOT_SIZE,
    height: AVATAR_SLOT_SIZE,
  },
  hidden: {
    opacity: 0,
  },
});
