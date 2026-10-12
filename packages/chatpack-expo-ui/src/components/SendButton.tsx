import { Pressable, StyleSheet, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import { useChatConfig, useChatTheme } from "../context/ChatUIProvider";
import { ChatIcon } from "../customization/icons";

export interface SendButtonProps {
  onPress: () => void;
  /** No sendable draft — the button renders inert. */
  disabled: boolean;
  /** Merged after the defaults; a function receives `{ pressed }`. */
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>) | undefined;
  className?: string | undefined;
  testID?: string | undefined;
}

/**
 * The composer's send control: a filled circle with the `send` icon, in
 * the accent color when there's something to send. Replace app-wide with
 * `components={{ SendButton: MySendButton }}` on `ChatUIProvider`.
 */
export function SendButton({ onPress, disabled, style, className, testID }: SendButtonProps) {
  const theme = useChatTheme();
  const { labels } = useChatConfig();
  const { colors, radius } = theme;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={labels.send}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={(state) => [
        styles.button,
        { backgroundColor: disabled ? colors.surface : colors.accent, borderRadius: radius.full, opacity: state.pressed ? 0.7 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...(className === undefined ? {} : { className })}
    >
      <ChatIcon name="send" size={18} color={disabled ? colors.mutedForeground : colors.accentForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
