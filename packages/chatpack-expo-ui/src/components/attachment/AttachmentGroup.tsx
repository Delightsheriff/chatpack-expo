import type { ReactNode } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ScrollFade } from "../../utils/ScrollFade";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";

export interface AttachmentGroupProps extends SlotProps<"AttachmentGroup"> {
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
export function AttachmentGroup({ children, style, className, styles: slotStyles, classNames }: AttachmentGroupProps) {
  const slots = useSlots("AttachmentGroup", { styles: slotStyles, classNames }, {});
  return (
    <ScrollFade>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, slots.style("content")]}
        style={[slots.style("root"), style]}
        {...slots.className("root", className)}
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
