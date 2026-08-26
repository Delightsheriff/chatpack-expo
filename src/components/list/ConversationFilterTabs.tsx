import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";

export interface ConversationFilterTab {
  key: string;
  label: string;
}

export interface ConversationFilterTabsProps {
  tabs: ConversationFilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * A segmented row (e.g. All / Unread / Groups) above a chat list.
 * Controlled — filtering `conversations` down by `activeKey` is your
 * app's concern, this only renders the tab state and reports taps.
 */
export function ConversationFilterTabs({ tabs, activeKey, onChange, style, className }: ConversationFilterTabsProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;

  return (
    <View style={[styles.row, { gap: spacing.sm }, style]} {...classNameProps(className)}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              {
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                backgroundColor: active ? colors.foreground : "transparent",
              },
            ]}
          >
            <Text style={{ color: active ? colors.background : colors.mutedForeground, fontSize: typography.caption, fontWeight: active ? "700" : "500" }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  tab: {
    alignItems: "center",
  },
});
