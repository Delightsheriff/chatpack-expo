import { useState } from "react";
import { Pressable, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { ChatIcon } from "../../customization/icons";
import { useSlots } from "../../customization/useSlots";
import { fontStyle } from "../../customization/resolveSlots";
import type { SlotProps } from "../../customization/slots";

export interface ConversationSearchBarProps extends SlotProps<"ConversationSearchBar"> {
  value: string;
  onChangeText: (text: string) => void;
  /** Defaults to `labels.searchPlaceholder`. */
  placeholder?: string | undefined;
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder"> | undefined;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/**
 * In-content search field for the conversation list, with a clear button.
 * On a native stack, prefer the header search bar
 * (`headerSearchBarOptions`) and feed its text to your filter instead —
 * this is for layouts without one (custom headers, tablets, web).
 *
 * Slots: `root`, `input` (state: `focused`, `hasValue`).
 */
export function ConversationSearchBar({
  value,
  onChangeText,
  placeholder,
  inputProps,
  style,
  className,
  testID,
  styles: slotStyles,
  classNames,
}: ConversationSearchBarProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const [focused, setFocused] = useState(false);
  const slots = useSlots("ConversationSearchBar", { styles: slotStyles, classNames }, { focused, hasValue: value.length > 0 });

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.sm, gap: spacing.xs },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      <ChatIcon name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? config.labels.searchPlaceholder}
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.accent}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        {...inputProps}
        onFocus={(e) => {
          setFocused(true);
          inputProps?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps?.onBlur?.(e);
        }}
        style={[{ flex: 1, color: colors.foreground, fontSize: typography.body, paddingVertical: spacing.sm }, fontStyle(theme), slots.style("input")]}
        {...slots.className("input")}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={config.labels.cancel}>
          <ChatIcon name="close" size={14} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}
