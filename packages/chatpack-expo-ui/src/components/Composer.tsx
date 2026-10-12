import { useState, useCallback } from "react";
import { View, TextInput, Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export interface ComposerProps {
  onSend: (body: string) => void;
  /** Rendered left of the input — an attach button wired to your own picker/BottomSheet, if any. */
  leadingAccessory?: React.ReactNode;
  placeholder?: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/**
 * Text input + send button. Deliberately doesn't own attachment picking or
 * safe-area insets — those are app/navigation concerns (pass a picker
 * trigger via `leadingAccessory`; wrap in your own `SafeAreaView`) — but
 * *does* expect to sit inside `ChatKeyboardView` (or your own
 * `KeyboardAvoidingView`) for keyboard push-up, since that's easy to get
 * wrong per-platform and not really this component's own concern to own
 * either.
 *
 * Draft text is local state, not lifted to the caller — nothing outside
 * this component needs it mid-keystroke (`react-state-minimize`).
 */
export function Composer({
  onSend,
  leadingAccessory,
  placeholder = "Message",
  maxLength,
  style,
  className,
  testID,
}: ComposerProps) {
  const { state } = useChatUI();
  const { colors, radius, spacing, typography } = state.theme;
  const [draft, setDraft] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  }, [draft, onSend]);

  const canSend = draft.trim().length > 0;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.background, borderTopColor: colors.border, padding: spacing.sm },
        style,
      ]}
      testID={testID}
      {...classNameProps(className)}
    >
      {leadingAccessory}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline
        maxLength={maxLength}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            color: colors.foreground,
            fontSize: typography.body,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? colors.accent : colors.surface, borderRadius: radius.full },
        ]}
      >
        <Text style={{ color: canSend ? colors.accentForeground : colors.mutedForeground, fontWeight: "600" }}>
          Send
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
