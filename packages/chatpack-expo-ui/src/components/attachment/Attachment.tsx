import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { AttachmentContext, type AttachmentState, type AttachmentSize, type AttachmentOrientation } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentProps extends SlotProps<"Attachment"> {
  state?: AttachmentState;
  size?: AttachmentSize;
  orientation?: AttachmentOrientation;
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The root attachment card — corresponds to shadcn's `Attachment`. No
 * separate `AttachmentTrigger` subcomponent: RN doesn't have the
 * DOM stacking-order problem a full-card `<a>`/`<button>` has over nested
 * action buttons (an inner `Pressable`'s touch target naturally wins over
 * its parent's), so `onPress` here does what `AttachmentTrigger` does on
 * the web version.
 */
export function Attachment({ state = "done", size = "default", orientation = "horizontal", onPress, children, style, className, styles: slotStyles, classNames }: AttachmentProps) {
  const { state: ui } = useChatUI();
  const { colors, radius, spacing } = ui.theme;
  const contextValue = useMemo(() => ({ state, size, orientation }), [state, size, orientation]);

  const isError = state === "error";
  const slots = useSlots("Attachment", { styles: slotStyles, classNames }, { state, size, orientation, pressed: false });

  return (
    <AttachmentContext.Provider value={contextValue}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.card,
          { flexDirection: orientation === "vertical" ? "column" : "row" },
          {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderColor: isError ? colors.destructive : colors.border,
            padding: size === "xs" ? spacing.xs : spacing.sm,
            gap: size === "xs" ? spacing.xs : spacing.sm,
            opacity: pressed ? 0.8 : 1,
          },
          slots.style("root", { pressed }),
          style,
        ]}
        {...slots.className("root", className)}
      >
        {children}
      </Pressable>
    </AttachmentContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 180,
  },
});
