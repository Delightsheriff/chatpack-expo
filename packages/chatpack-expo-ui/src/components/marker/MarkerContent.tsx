import { Text, type StyleProp, type TextStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ShimmerText } from "../../utils/shimmer";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { fontStyle } from "../../customization/resolveSlots";

export interface MarkerContentProps extends SlotProps<"MarkerContent"> {
  children: string;
  /** The `shimmer` utility applied to this content — an animated streaming-text effect, per shadcn's own "add the shimmer utility class to MarkerContent" guidance, translated to a prop since RN has no utility classes. */
  shimmer?: boolean;
  style?: StyleProp<TextStyle>;
  className?: string;
}

/** The marker text — corresponds to shadcn's `MarkerContent`. */
export function MarkerContent({ children, shimmer, style, className, styles: slotStyles, classNames }: MarkerContentProps) {
  const { state } = useChatUI();
  const slots = useSlots("MarkerContent", { styles: slotStyles, classNames }, { shimmer: shimmer ?? false });
  const textStyle = [
    { color: state.theme.colors.mutedForeground, fontSize: state.theme.typography.caption },
    fontStyle(state.theme, "medium"),
    slots.style("text"),
    style,
  ];

  if (shimmer) {
    return (
      <ShimmerText style={textStyle} className={classNames?.text ?? className}>
        {children}
      </ShimmerText>
    );
  }

  return (
    <Text
      style={textStyle}
      {...slots.className("text", className)}
    >
      {children}
    </Text>
  );
}
