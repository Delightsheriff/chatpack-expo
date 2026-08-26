import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useAttachmentContext, ATTACHMENT_MEDIA_SIZE } from "./context";
import { classNameProps } from "../../utils/classNameProps";

export interface AttachmentMediaProps {
  variant?: "icon" | "image";
  /** An icon element (`variant="icon"`) or an `expo-image`/`Image` element (`variant="image"`) — this component only frames it, matching shadcn's "render an `<img>` inside it" model. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** The media slot — corresponds to shadcn's `AttachmentMedia`. */
export function AttachmentMedia({ variant = "icon", children, style, className }: AttachmentMediaProps) {
  const { state: ui } = useChatUI();
  const { size } = useAttachmentContext();
  const dimension = ATTACHMENT_MEDIA_SIZE[size];

  return (
    <View
      style={[
        styles.frame,
        { width: dimension, height: dimension, borderRadius: ui.theme.radius.sm, overflow: "hidden" },
        variant === "icon" && { backgroundColor: ui.theme.colors.background, alignItems: "center", justifyContent: "center" },
        style,
      ]}
      {...classNameProps(className)}
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
