import type { ReactNode } from "react";
import { useOptionalAttachmentContext } from "./context";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentContentProps extends SlotProps<"AttachmentContent"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** Wraps `AttachmentTitle`/`AttachmentDescription` — corresponds to shadcn's `AttachmentContent`. */
export function AttachmentContent({ children, style, className, styles: slotStyles, classNames }: AttachmentContentProps) {
  const slots = useSlots("AttachmentContent", { styles: slotStyles, classNames }, useOptionalAttachmentContext());
  return (
    <View
      style={[styles.column, slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    flexShrink: 1,
  },
});
