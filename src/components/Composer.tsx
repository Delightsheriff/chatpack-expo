import type { ReactNode, Ref } from "react";
import { View, TextInput, StyleSheet, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { useChatComponent, useChatUI } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import { fontStyle } from "../customization/resolveSlots";
import type { SlotProps } from "../customization/slots";
import { SendButton } from "./SendButton";
import { useComposer, type UseComposerResult } from "./useComposer";

export interface ComposerProps extends SlotProps<"Composer"> {
  /** Called with the trimmed text; the draft clears right after. */
  onSend: (body: string) => void;
  /** Controlled draft (saved drafts, edit mode). Pair with `onChangeText`. */
  value?: string | undefined;
  onChangeText?: ((text: string) => void) | undefined;
  defaultValue?: string | undefined;
  /** Defaults to `labels.composerPlaceholder`. */
  placeholder?: string | undefined;
  maxLength?: number | undefined;
  /** Left of the input — an attach/camera button wired to your own picker. */
  leadingAccessory?: ReactNode;
  /** Inside the input, at its end — e.g. a sticker or camera icon. */
  trailingAccessory?: ReactNode;
  /** Above the input row — a reply/edit preview bar. */
  topAccessory?: ReactNode;
  /**
   * Replace the send control. A function receives the composer state, so a
   * design can e.g. show a mic when empty and send when there's text:
   * `sendButton={({ canSend, send }) => canSend ? <Send onPress={send} /> : <Mic />}`.
   * Default: `components.SendButton`.
   */
  sendButton?: ReactNode | ((composer: UseComposerResult) => ReactNode);
  /** Return key sends instead of inserting a newline (tablet/desktop style). Default `false`. */
  sendOnSubmit?: boolean | undefined;
  /** Passed through to the `TextInput` (autoFocus, keyboardAppearance, …). */
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder" | "maxLength"> | undefined;
  /** Ref to the underlying `TextInput` (focus after "Reply", blur on send…). */
  inputRef?: Ref<TextInput> | undefined;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/**
 * The message input bar: optional top accessory, leading accessory, a
 * growing multiline input with an optional trailing accessory, and the send
 * control. Sending fires the `send` haptic. Put it inside
 * `ChatKeyboardView.Dock` so it rides on the keyboard.
 *
 * For a fully custom bar, use `useComposer` directly.
 *
 * Slots: `root`, `inputWrapper`, `input`, `sendButton` (state: `canSend`,
 * `pressed` on the button).
 */
export function Composer({
  onSend,
  value,
  onChangeText,
  defaultValue,
  placeholder,
  maxLength,
  leadingAccessory,
  trailingAccessory,
  topAccessory,
  sendButton,
  sendOnSubmit = false,
  inputProps,
  inputRef,
  style,
  className,
  testID,
  styles: slotStyles,
  classNames,
}: ComposerProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const composer = useComposer({ onSend, value, onChangeText, defaultValue });
  const SendButtonComponent = useChatComponent("SendButton", SendButton);
  const slots = useSlots("Composer", { styles: slotStyles, classNames }, { canSend: composer.canSend, pressed: false });

  const setRefs = (node: TextInput | null) => {
    composer.inputRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) (inputRef as { current: TextInput | null }).current = node;
  };

  const resolvedSendButton =
    typeof sendButton === "function" ? (
      sendButton(composer)
    ) : sendButton !== undefined ? (
      sendButton
    ) : (
      <SendButtonComponent
        onPress={composer.send}
        disabled={!composer.canSend}
        style={({ pressed }) => slots.style("sendButton", { pressed })}
        className={classNames?.sendButton}
      />
    );

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        { backgroundColor: colors.background, borderTopColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
        slots.style("root"),
        style,
      ]}
      {...slots.className("root", className)}
    >
      {topAccessory}
      <View style={[styles.row, { gap: spacing.sm }]}>
        {leadingAccessory}
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border, paddingHorizontal: spacing.md },
            slots.style("inputWrapper"),
          ]}
          {...slots.className("inputWrapper")}
        >
          <TextInput
            ref={setRefs}
            value={composer.value}
            onChangeText={composer.setValue}
            placeholder={placeholder ?? config.labels.composerPlaceholder}
            placeholderTextColor={colors.mutedForeground}
            selectionColor={colors.accent}
            multiline
            maxLength={maxLength}
            accessibilityLabel={placeholder ?? config.labels.composerPlaceholder}
            {...(sendOnSubmit ? { submitBehavior: "submit" as const, onSubmitEditing: composer.send, returnKeyType: "send" as const } : null)}
            {...inputProps}
            style={[
              styles.input,
              { color: colors.foreground, fontSize: typography.body, paddingVertical: spacing.sm },
              fontStyle(theme),
              slots.style("input"),
            ]}
            {...slots.className("input")}
          />
          {trailingAccessory}
        </View>
        {resolvedSendButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
  },
  input: {
    flex: 1,
    maxHeight: 140,
    paddingTop: 8,
  },
});
