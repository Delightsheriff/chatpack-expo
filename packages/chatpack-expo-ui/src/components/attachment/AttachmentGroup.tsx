import type { ReactNode } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ScrollFade } from "../../utils/ScrollFade";
import { classNameProps } from "../../utils/classNameProps";

export interface AttachmentGroupProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Lays out attachments in a horizontally scrollable row with an edge fade
 * — corresponds to shadcn's `AttachmentGroup`. Unlike the web version's
 * CSS scroll-snap, this doesn't snap to card boundaries: RN's snap APIs
 * (`snapToOffsets`/`snapToInterval`) need fixed or precomputed card
 * widths, which a group of arbitrarily-sized cards doesn't have. If you
 * need snapping, use fixed-width cards (`Attachment size="sm"` or `"xs"`
 * consistently) and pass `snapToInterval` via `style`/a wrapping
 * `ScrollView` of your own.
 */
export function AttachmentGroup({ children, style, className }: AttachmentGroupProps) {
  return (
    <ScrollFade>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={style}
        {...classNameProps(className)}
      >
        {children}
      </ScrollView>
    </ScrollFade>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
});
