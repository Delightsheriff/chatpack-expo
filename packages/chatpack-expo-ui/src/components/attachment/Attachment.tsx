import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { AttachmentContext, type AttachmentState, type AttachmentSize, type AttachmentOrientation } from "./context";
import { classNameProps } from "../../utils/classNameProps";

export interface AttachmentProps {
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
export function Attachment({ state = "done", size = "default", orientation = "horizontal", onPress, children, style, className }: AttachmentProps) {
  const { state: ui } = useChatUI();
  const { colors, radius, spacing } = ui.theme;
  const contextValue = useMemo(() => ({ state, size, orientation }), [state, size, orientation]);

  const isError = state === "error";

  return (
    <AttachmentContext.Provider value={contextValue}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { flexDirection: orientation === "vertical" ? "column" : "row" },
          {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderColor: isError ? colors.destructive : colors.border,
            padding: size === "xs" ? spacing.xs : spacing.sm,
            gap: size === "xs" ? spacing.xs : spacing.sm,
          },
          style,
        ]}
        {...classNameProps(className)}
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
