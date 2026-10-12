import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatTheme } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageContext } from "./context";

export interface MessageContentProps extends SlotProps<"MessageContent"> {
  /** `MessageHeader`, the message surface (`Bubble`), and `MessageFooter`, in that order. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Wraps the header, message surface, and footer in one column —
 * corresponds to shadcn's `MessageContent`. Purely a layout container; the
 * avatar-offset behavior lives in `MessageAvatar`/`MessageFooter`
 * themselves, not here.
 *
 * Its max width is `theme.bubble.maxWidth` of the row — the cap every
 * bubble inside it sizes against.
 *
 * Slots: `root`.
 */
export function MessageContent({ children, style, className, styles: slotStyles, classNames }: MessageContentProps) {
  const theme = useChatTheme();
  const { isOwn, align, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const slots = useSlots("MessageContent", { styles: slotStyles, classNames }, { isOwn, align, groupedWithPrevious, groupedWithNext });

  return (
    <View
      style={[
        styles.column,
        { maxWidth: `${theme.bubble.maxWidth * 100}%`, alignItems: align === "end" ? "flex-end" : "flex-start" },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flexShrink: 1,
  },
});
