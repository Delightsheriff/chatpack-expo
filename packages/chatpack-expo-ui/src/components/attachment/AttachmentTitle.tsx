import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ShimmerText } from "../../utils/shimmer";
import { useAttachmentContext } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { fontStyle } from "../../customization/resolveSlots";

export interface AttachmentTitleProps extends SlotProps<"AttachmentTitle"> {
  children: string;
  style?: StyleProp<TextStyle>;
  className?: string | undefined;
}

/** The attachment name. Shimmers while `state` is `"uploading"` or `"processing"` — corresponds to shadcn's `AttachmentTitle`. */
export function AttachmentTitle({ children, style, className, styles: slotStyles, classNames }: AttachmentTitleProps) {
  const { state: ui } = useChatUI();
  const attachment = useAttachmentContext();
  const { state, size } = attachment;
  const slots = useSlots("AttachmentTitle", { styles: slotStyles, classNames }, attachment);
  const isBusy = state === "uploading" || state === "processing";
  const isError = state === "error";
  const color = isError ? ui.theme.colors.destructive : ui.theme.colors.foreground;
  const fontSize = size === "xs" ? ui.theme.typography.caption : ui.theme.typography.body;

  if (isBusy) {
    return (
      <ShimmerText style={[{ color, fontSize }, fontStyle(ui.theme, "medium"), slots.style("text"), style]} className={classNames?.text ?? className}>
        {children}
      </ShimmerText>
    );
  }

  return (
    <Text
      numberOfLines={1}
      style={[{ color, fontSize }, fontStyle(ui.theme, "medium"), slots.style("text"), style]}
      {...slots.className("text", className)}
    >
      {children}
    </Text>
  );
}
