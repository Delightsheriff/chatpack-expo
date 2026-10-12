import { Pressable, ScrollView, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";

export interface ConversationFilterTab {
  key: string;
  label: string;
}

export interface ConversationFilterTabsProps extends SlotProps<"ConversationFilterTabs"> {
  tabs: ConversationFilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Horizontally scrolling filter chips for the conversation list
 * (All / Unread / Groups…). Fires the `selection` haptic on change.
 *
 * Slots: `root`, `tab`, `tabText` (state: `active`, `pressed`).
 */
export function ConversationFilterTabs({ tabs, activeKey, onChange, style, className, styles: slotStyles, classNames }: ConversationFilterTabsProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const slots = useSlots("ConversationFilterTabs", { styles: slotStyles, classNames }, { active: false, pressed: false });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={[styles.row, { gap: spacing.sm, paddingHorizontal: spacing.lg }]}
      style={[slots.style("root"), style]}
      {...slots.className("root", className)}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              config.haptics("selection");
              onChange(tab.key);
            }}
            style={({ pressed }) => [
              {
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
                backgroundColor: active ? colors.foreground : colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
              slots.style("tab", { active, pressed }),
            ]}
            {...slots.className("tab")}
          >
            <Text
              style={[
                { color: active ? colors.background : colors.foreground, fontSize: typography.caption },
                fontStyle(theme, active ? "semibold" : "medium"),
                slots.style("tabText", { active }),
              ]}
              {...slots.className("tabText")}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});
