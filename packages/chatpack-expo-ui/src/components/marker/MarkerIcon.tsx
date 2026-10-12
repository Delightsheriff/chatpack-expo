import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface MarkerIconProps extends SlotProps<"MarkerIcon"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * A decorative icon slot — corresponds to shadcn's `MarkerIcon`. Hidden
 * from assistive tech (`importantForAccessibility="no-hide-descendants"`
 * on Android, `accessibilityElementsHidden` on iOS — RN's two-platform
 * equivalent of `aria-hidden`), so the adjacent `MarkerContent` carries the
 * meaning. For an icon-only marker with no `MarkerContent`, set
 * `accessibilityLabel` on the `Marker` root instead.
 */
export function MarkerIcon({ children, style, className, styles: slotStyles, classNames }: MarkerIconProps) {
  const slots = useSlots("MarkerIcon", { styles: slotStyles, classNames }, {});
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {children}
    </View>
  );
}
