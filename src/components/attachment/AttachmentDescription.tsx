import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useAttachmentContext } from "./context";

export interface AttachmentDescriptionProps {
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
export function AttachmentDescription({ children, style, className }: AttachmentDescriptionProps) {
  const { state: ui } = useChatUI();
  const { state } = useAttachmentContext();
  const color = state === "error" ? ui.theme.colors.destructive : ui.theme.colors.mutedForeground;

  return (
    <Text
      numberOfLines={1}
      style={[{ color, fontSize: ui.theme.typography.caption }, style]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </Text>
  );
}
