import type { ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useOptionalAttachmentContext } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentActionProps extends SlotProps<"AttachmentAction"> {
  onPress?: () => void;
  /**
   * Required, not optional: `AttachmentAction` is icon-only by design (per
   * shadcn's own accessibility guidance — "give each one an aria-label
   * describing the action and its target"). There's no visible text for a
   * screen reader to fall back to, so this can't be an afterthought.
   */
  accessibilityLabel: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** An icon-only action button — corresponds to shadcn's `AttachmentAction`. */
export function AttachmentAction({ onPress, accessibilityLabel, children, style, className, styles: slotStyles, classNames }: AttachmentActionProps) {
  const { state } = useChatUI();
  const attachment = useOptionalAttachmentContext();
  const slots = useSlots("AttachmentAction", { styles: slotStyles, classNames }, { ...attachment, pressed: false });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { borderRadius: state.theme.radius.full, opacity: pressed ? 0.6 : 1 }, slots.style("root", { pressed }), style]}
      {...slots.className("root", className)}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
