import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatTheme } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageAvatarAlignment } from "./avatar-alignment";
import { useMessageContext } from "./context";

export interface MessageAvatarProps extends SlotProps<"MessageAvatar"> {
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

/**
 * The avatar slot — corresponds to shadcn's `MessageAvatar`. Bottom-anchors
 * to the row by default (via `Message`'s `alignItems: "flex-end"`), then
 * shifts up by the sibling `MessageFooter`'s measured height so it stays
 * aligned with the bubble surface rather than the footer, matching
 * shadcn's own behavior. Sized by `theme.avatar.messageSize`.
 *
 * Slots: `root`.
 */
export function MessageAvatar({ children, visible, style, className, styles: slotStyles, classNames }: MessageAvatarProps) {
  const theme = useChatTheme();
  const { isOwn, align, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const { footerHeight } = useMessageAvatarAlignment();
  const isVisible = visible ?? !groupedWithNext;
  const size = theme.avatar.messageSize;
  const slots = useSlots("MessageAvatar", { styles: slotStyles, classNames }, {
    isOwn,
    align,
    groupedWithPrevious,
    groupedWithNext,
    visible: isVisible,
  });

  return (
    <View
      style={[{ width: size, height: size, marginBottom: footerHeight }, !isVisible && styles.hidden, slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {isVisible && children}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
});
