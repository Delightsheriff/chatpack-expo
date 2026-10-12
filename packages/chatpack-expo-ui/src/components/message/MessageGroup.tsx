import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { classNameProps } from "../../utils/classNameProps";

export interface MessageGroupProps {
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
 * `previousMessage`/`nextMessage` props, so this component doesn't
 * recompute anything — it exists so the group reads as one unit in your
 * JSX and gives you one place to adjust inter-group spacing.
 */
export function MessageGroup({ children, style, className }: MessageGroupProps) {
  return (
    <View
      style={style}
      {...classNameProps(className)}
    >
      {children}
    </View>
  );
}
