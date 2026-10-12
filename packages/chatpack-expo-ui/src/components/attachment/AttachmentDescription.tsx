import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useAttachmentContext } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { fontStyle } from "../../customization/resolveSlots";

export interface AttachmentDescriptionProps extends SlotProps<"AttachmentDescription"> {
  children: string;
  style?: StyleProp<TextStyle>;
  className?: string;
}

/**
 * Secondary metadata — file type, size, or upload status text (e.g.
 * `"Uploading · 64%"`; you compute the percentage, this just renders the
 * string). Corresponds to shadcn's `AttachmentDescription`. Switches to
 * the destructive color on `state="error"`, so keep the failure reason in
 * the text itself rather than relying on color alone.
 */
export function AttachmentDescription({ children, style, className, styles: slotStyles, classNames }: AttachmentDescriptionProps) {
  const { state: ui } = useChatUI();
  const attachment = useAttachmentContext();
  const { state } = attachment;
  const slots = useSlots("AttachmentDescription", { styles: slotStyles, classNames }, attachment);
  const color = state === "error" ? ui.theme.colors.destructive : ui.theme.colors.mutedForeground;

  return (
    <Text
      numberOfLines={1}
      style={[{ color, fontSize: ui.theme.typography.caption }, fontStyle(ui.theme), slots.style("text"), style]}
      {...slots.className("text", className)}
    >
      {children}
    </Text>
  );
}
