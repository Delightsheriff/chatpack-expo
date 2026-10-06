import { TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChatUI } from "../../context/ChatUIProvider";
import { classNameProps } from "../../utils/classNameProps";

export interface ConversationSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/** Controlled search bar for conversation list. */
export function ConversationSearchBar({
  value,
  onChangeText,
  placeholder = "Search…",
  style,
  className,
  testID,
}: ConversationSearchBarProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.full,
          paddingHorizontal: spacing.md,
          gap: spacing.xs,
        },
        style,
      ]}
      {...classNameProps(className)}
    >
      <Ionicons name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={{ flex: 1, color: colors.foreground, fontSize: typography.body, paddingVertical: spacing.sm }}
      />
    </View>
  );
}
