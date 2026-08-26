import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../context/ChatUIProvider";
import { ShimmerText } from "../utils/shimmer";

export type MarkerVariant = "date" | "system" | "streaming";

export interface MarkerProps {
  variant: MarkerVariant;
  /** e.g. "Today", "Alice added Bob", "Connecting…" — `Marker` doesn't compute this, callers do (`formatDateMarker` for `variant="date"`). */
  label: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A labeled, bordered separator row — date breaks, system notices
 * ("X joined the conversation"), and live status ("Connecting…", using
 * `variant="streaming"` for the shimmer effect). Corresponds to shadcn's
 * `Marker`.
 */
export function Marker({ variant, label, style }: MarkerProps) {
  const { state } = useChatUI();
  const { colors, spacing, typography } = state.theme;

  if (variant === "date") {
    return (
      <View style={[styles.dateRow, { marginVertical: spacing.md }, style]}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={{ color: colors.mutedForeground, fontSize: typography.caption, marginHorizontal: spacing.sm }}>
          {label}
        </Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  if (variant === "streaming") {
    return (
      <View style={[styles.centerRow, { marginVertical: spacing.sm }, style]}>
        <ShimmerText style={{ color: colors.mutedForeground, fontSize: typography.caption }}>{label}</ShimmerText>
      </View>
    );
  }

  return (
    <View style={[styles.centerRow, { marginVertical: spacing.sm }, style]}>
      <Text style={{ color: colors.mutedForeground, fontSize: typography.caption }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  centerRow: {
    alignItems: "center",
  },
});
