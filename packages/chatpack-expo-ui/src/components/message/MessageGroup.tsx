import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface MessageGroupProps extends SlotProps<"MessageGroup"> {
  /** Consecutive `<Message>` elements from the same sender. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Groups consecutive messages from the same sender — corresponds to
 * shadcn's `MessageGroup`. Purely a spacing/semantic wrapper: the actual
 * per-row grouping visuals (flattened bubble corners, hidden avatar on
 * non-last rows) are already computed per-`Message` from its
 * `previousMessage`/`nextMessage` props.
 *
 * Slots: `root`.
 */
export function MessageGroup({ children, style, className, styles: slotStyles, classNames }: MessageGroupProps) {
  const slots = useSlots("MessageGroup", { styles: slotStyles, classNames }, {});
  return (
    <View style={[slots.style("root"), style]} {...slots.className("root", className)}>
      {children}
    </View>
  );
}
