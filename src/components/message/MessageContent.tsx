import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useMessageContext } from "./context";
import { classNameProps } from "../../utils/classNameProps";

export interface MessageContentProps {
  /** `MessageHeader`, the message surface (`Bubble`), and `MessageFooter`, in that order. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Wraps the header, message surface, and footer in one column —
 * corresponds to shadcn's `MessageContent`. Purely a layout container; the
 * avatar-offset behavior lives in `MessageAvatar`/`MessageFooter`
 * themselves, not here, so this stays a plain wrapper with no internal
 * child-detection logic to fight if you swap in your own surface.
 *
 * Aligns its children (header/bubble/footer) to the same edge as
 * `Message`'s resolved `align`, read from context rather than re-derived,
 * so this can never disagree with an `align` override on `Message`.
 */
export function MessageContent({ children, style, className }: MessageContentProps) {
  const { align } = useMessageContext();

  return (
    <View
      style={[styles.column, { alignItems: align === "end" ? "flex-end" : "flex-start" }, style]}
      {...classNameProps(className)}
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
