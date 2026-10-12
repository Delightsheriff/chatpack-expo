import type { ReactNode } from "react";
import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import { useChatTheme } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";
import { useMessageContext } from "./context";

export interface MessageHeaderProps extends SlotProps<"MessageHeader"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Content above the message — a sender name, typically. Wraps plain
 * strings in a styled `Text` (the `text` slot) so
 * `<MessageHeader>Olivia</MessageHeader>` works without ceremony; any
 * other node renders as-is.
 *
 * Slots: `root`, `text`.
 */
export function MessageHeader({ children, style, className, styles: slotStyles, classNames }: MessageHeaderProps) {
  const theme = useChatTheme();
  const { colors, typography, spacing } = theme;
  const { isOwn, align, groupedWithPrevious, groupedWithNext } = useMessageContext();
  const slots = useSlots("MessageHeader", { styles: slotStyles, classNames }, { isOwn, align, groupedWithPrevious, groupedWithNext });

  return (
    <View style={[{ marginBottom: spacing.xs / 2 }, slots.style("root"), style]} {...slots.className("root", className)}>
      {typeof children === "string" ? (
        <Text
          style={[{ color: colors.mutedForeground, fontSize: typography.caption }, fontStyle(theme, "semibold"), slots.style("text")]}
          {...slots.className("text")}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
