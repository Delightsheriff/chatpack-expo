import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import type { MarkerVariant } from "./context";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface MarkerProps extends SlotProps<"Marker"> {
  variant?: MarkerVariant;
  /**
   * Set `"status"` for streaming/in-progress markers ("Thinking…", a
   * running tool) so assistive tech announces the update — mirrors
   * shadcn's `role="status"`. On Android this sets
   * `accessibilityLiveRegion="polite"` (RN's native live-region support);
   * iOS has no live-region equivalent, so this also calls
   * `AccessibilityInfo.announceForAccessibility` with the marker's text
   * content whenever it changes. Leave unset for a labeled separator
   * (`variant="separator"`) — shadcn's own guidance: a separator that
   * carries text needs no role, since role="separator" would strip its
   * accessible name down to nothing (see this package's README).
   */
  role?: "status";
  /** For a decorative icon-only marker with no `MarkerContent` — RN has no bare `aria-label` on a View otherwise. */
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return props?.children ? extractText(props.children) : "";
  }
  return "";
}

/**
 * The root marker element — corresponds to shadcn's `Marker`. No
 * render-prop polymorphism (RN has no equivalent); wrap `Marker` in your
 * own `Pressable`/`Link` for link/button semantics.
 *
 * Slots: `root`, `line` (separator rules; state: `variant`).
 */
export function Marker({ variant = "default", role, accessibilityLabel, children, style, className, styles: slotStyles, classNames }: MarkerProps) {
  const { state } = useChatUI();
  const { colors, spacing } = state.theme;
  const slots = useSlots("Marker", { styles: slotStyles, classNames }, { variant });

  const text = useMemo(() => extractText(children), [children]);
  const previousText = useRef<string | null>(null);
  useEffect(() => {
    if (role !== "status" || Platform.OS !== "ios") return;
    if (text && text !== previousText.current) {
      AccessibilityInfo.announceForAccessibility(text);
    }
    previousText.current = text;
  }, [role, text]);

  return (
    <View
      accessibilityLiveRegion={role === "status" && Platform.OS === "android" ? "polite" : "none"}
      accessibilityLabel={accessibilityLabel}
      style={[
        variant === "separator" ? styles.separatorRow : styles.inlineRow,
        { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, gap: spacing.xs },
        variant === "border" && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {variant === "separator" ? (
        <>
          <View style={[styles.line, { backgroundColor: colors.border }, slots.style("line")]} {...slots.className("line")} />
          {children}
          <View style={[styles.line, { backgroundColor: colors.border }, slots.style("line")]} {...slots.className("line")} />
        </>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
