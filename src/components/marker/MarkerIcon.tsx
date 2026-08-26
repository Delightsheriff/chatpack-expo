import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

export interface MarkerIconProps {
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
export function MarkerIcon({ children, style, className }: MarkerIconProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </View>
  );
}
