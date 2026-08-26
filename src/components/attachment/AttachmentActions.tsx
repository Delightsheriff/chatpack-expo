import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

export interface AttachmentActionsProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** A container for one or more `AttachmentAction`s, aligned to the end of the card — corresponds to shadcn's `AttachmentActions`. */
export function AttachmentActions({ children, style, className }: AttachmentActionsProps) {
  return (
    <View
      style={[styles.row, style]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 4,
  },
});
