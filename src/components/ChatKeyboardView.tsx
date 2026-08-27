import { useEffect, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { classNameProps } from "../utils/classNameProps";

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
 *
 * `enabled` starts `false` and flips to `true` right after mount, rather
 * than being passed straight through as `true` from the first render. On
 * iOS, `KeyboardAvoidingView` computes its `"padding"` inset from the
 * frame it has measured *so far* — on the very first paint that's still
 * `{height: 0}`, so a nonzero `keyboardVerticalOffset` (any screen with a
 * header above this view has one) produces a large negative inset and the
 * whole subtree — message list, composer, everything — renders
 * effectively clipped to nothing until some later event (typically the
 * keyboard actually opening) forces a recompute. Mounting disabled for
 * one tick renders children as a plain view first — which is what
 * performs the real layout measurement `KeyboardAvoidingView` needs —
 * then hands control to the native keyboard-avoidance behavior once that
 * measurement exists, so it never computes from a zero frame at all. A
 * conversation screen entered fresh (not mid-navigation-animation, where
 * a frame already exists) is exactly the case this was silently eating.
 */
export function ChatKeyboardView({ children, keyboardVerticalOffset = 0, style, className }: ChatKeyboardViewProps) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(true);
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={enabled}
      {...classNameProps(className)}
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
