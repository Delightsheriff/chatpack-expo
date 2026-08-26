import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

export interface ChatKeyboardViewProps {
  children: ReactNode;
  /** Extra offset if you have a header/nav bar above this view (e.g. a stack navigator's header height). */
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Wraps a message list + composer with keyboard push-up that actually
 * works on both platforms — the behavior genuinely differs between iOS and
 * Android (iOS: `"padding"`; Android: `"height"`, since Android has no
 * `contentInset`-style overscroll to lean on the way iOS does), and
 * getting only one platform right is the most common version of this bug.
 *
 * Android also needs `"softwareKeyboardLayoutMode": "resize"` under
 * `"android"` in `app.json` for this to behave — `KeyboardAvoidingView`
 * alone isn't sufficient there. See this package's README.
 */
export function ChatKeyboardView({ children, keyboardVerticalOffset = 0, style, className }: ChatKeyboardViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
