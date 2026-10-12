import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useAttachmentContext, ATTACHMENT_MEDIA_SIZE } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentMediaProps extends SlotProps<"AttachmentMedia"> {
  variant?: "icon" | "image";
  /** An icon element (`variant="icon"`) or an `expo-image`/`Image` element (`variant="image"`) — this component only frames it, matching shadcn's "render an `<img>` inside it" model. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** The media slot — corresponds to shadcn's `AttachmentMedia`. */
export function AttachmentMedia({ variant = "icon", children, style, className, styles: slotStyles, classNames }: AttachmentMediaProps) {
  const { state: ui } = useChatUI();
  const attachment = useAttachmentContext();
  const { size } = attachment;
  const slots = useSlots("AttachmentMedia", { styles: slotStyles, classNames }, { ...attachment, variant });
  const dimension = ATTACHMENT_MEDIA_SIZE[size];

  return (
    <View
      style={[
        styles.frame,
        { width: dimension, height: dimension, borderRadius: ui.theme.radius.sm, overflow: "hidden" },
        variant === "icon" && { backgroundColor: ui.theme.colors.background, alignItems: "center", justifyContent: "center" },
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
  frame: {
    flexShrink: 0,
  },
});
