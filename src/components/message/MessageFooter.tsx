import { useCallback, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageAvatarAlignment } from "./avatar-alignment";
import { useMessageContext } from "./context";

export interface MessageFooterProps extends SlotProps<"MessageFooter"> {
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
 *
 * Slots: `root`.
 */
export function MessageFooter({ children, style, className, styles: slotStyles, classNames }: MessageFooterProps) {
  const { isOwn, align, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const { reportFooterHeight } = useMessageAvatarAlignment();
  const slots = useSlots("MessageFooter", { styles: slotStyles, classNames }, { isOwn, align, groupedWithPrevious, groupedWithNext });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => reportFooterHeight(event.nativeEvent.layout.height),
    [reportFooterHeight],
  );

  return (
    <View
      onLayout={onLayout}
      style={[
        { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: align === "end" ? "flex-end" : "flex-start", marginTop: 2 },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {children}
    </View>
  );
}
