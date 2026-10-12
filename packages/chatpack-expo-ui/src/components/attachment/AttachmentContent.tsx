import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { classNameProps } from "../../utils/classNameProps";

export interface AttachmentContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** Wraps `AttachmentTitle`/`AttachmentDescription` — corresponds to shadcn's `AttachmentContent`. */
export function AttachmentContent({ children, style, className }: AttachmentContentProps) {
  return (
    <View
      style={[styles.column, style]}
      {...classNameProps(className)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    flexShrink: 1,
  },
});
