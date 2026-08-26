import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ShimmerText } from "../../utils/shimmer";

export interface MarkerContentProps {
  children: string;
  /** The `shimmer` utility applied to this content — an animated streaming-text effect, per shadcn's own "add the shimmer utility class to MarkerContent" guidance, translated to a prop since RN has no utility classes. */
  shimmer?: boolean;
  style?: StyleProp<TextStyle>;
  className?: string;
}

/** The marker text — corresponds to shadcn's `MarkerContent`. */
export function MarkerContent({ children, shimmer, style, className }: MarkerContentProps) {
  const { state } = useChatUI();
  const textStyle = [{ color: state.theme.colors.mutedForeground, fontSize: state.theme.typography.caption }, style];

  if (shimmer) {
    return (
      <ShimmerText style={textStyle} className={className}>
        {children}
      </ShimmerText>
    );
  }

  return (
    <Text
      style={textStyle}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </Text>
  );
}
