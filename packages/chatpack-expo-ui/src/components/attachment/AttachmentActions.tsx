import type { ReactNode } from "react";
import { useOptionalAttachmentContext } from "./context";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentActionsProps extends SlotProps<"AttachmentActions"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** A container for one or more `AttachmentAction`s, aligned to the end of the card — corresponds to shadcn's `AttachmentActions`. */
export function AttachmentActions({ children, style, className, styles: slotStyles, classNames }: AttachmentActionsProps) {
  const slots = useSlots("AttachmentActions", { styles: slotStyles, classNames }, useOptionalAttachmentContext());
  return (
    <View
      style={[styles.row, slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 4,
  },
});
