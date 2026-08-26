import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ShimmerText } from "../../utils/shimmer";
import { useAttachmentContext } from "./context";

export interface AttachmentTitleProps {
  children: string;
  style?: StyleProp<TextStyle>;
  className?: string | undefined;
}

/** The attachment name. Shimmers while `state` is `"uploading"` or `"processing"` — corresponds to shadcn's `AttachmentTitle`. */
export function AttachmentTitle({ children, style, className }: AttachmentTitleProps) {
  const { state: ui } = useChatUI();
  const { state, size } = useAttachmentContext();
  const isBusy = state === "uploading" || state === "processing";
  const isError = state === "error";
  const color = isError ? ui.theme.colors.destructive : ui.theme.colors.foreground;
  const fontSize = size === "xs" ? ui.theme.typography.caption : ui.theme.typography.body;

  if (isBusy) {
    return (
      <ShimmerText style={[{ color, fontSize }, style]} className={className}>
        {children}
      </ShimmerText>
    );
  }

  return (
    <Text
      numberOfLines={1}
      style={[{ color, fontSize }, style]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </Text>
  );
}
