import { useCallback, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useMessageAvatarAlignment } from "./avatar-alignment";
import { useMessageContext } from "./context";
import { classNameProps } from "../../utils/classNameProps";

export interface MessageFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Content below the message — status text (pair with `ReadReceipt`) or
 * actions. Aligns to the message's side (start/end, from context) and
 * reports its own rendered height so the sibling `MessageAvatar` can offset
 * itself by exactly that amount and stay aligned with the bubble instead
 * of dropping to the footer's bottom edge.
 */
export function MessageFooter({ children, style, className }: MessageFooterProps) {
  const { align } = useMessageContext();
  const { reportFooterHeight } = useMessageAvatarAlignment();

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => reportFooterHeight(event.nativeEvent.layout.height),
    [reportFooterHeight],
  );

  return (
    <View
      onLayout={onLayout}
      style={[{ flexDirection: "row", alignSelf: align === "end" ? "flex-end" : "flex-start", marginTop: 2 }, style]}
      {...classNameProps(className)}
    >
      {children}
    </View>
  );
}
