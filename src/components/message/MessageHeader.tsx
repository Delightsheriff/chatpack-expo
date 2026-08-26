import type { ReactNode } from "react";
import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";

export interface MessageHeaderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Content above the message — a sender name, typically. Stays aligned to
 * the start regardless of `Message`'s `align` (shadcn's own spec) — this
 * falls out naturally in RN from being a plain-flowing `Text`/`View` inside
 * `MessageContent`'s own (already correctly-aligned-but-content-width)
 * column, so no extra alignment logic is needed here.
 *
 * Renders raw `children` if it's already a `Text`-like node; wraps plain
 * strings in a styled `Text` so `<MessageHeader>Olivia</MessageHeader>`
 * works without ceremony.
 */
export function MessageHeader({ children, style, className }: MessageHeaderProps) {
  const { state } = useChatUI();
  const { colors, typography, spacing } = state.theme;

  return (
    <View
      style={[{ marginBottom: spacing.xs / 2 }, style]}
      // @ts-expect-error className forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      {typeof children === "string" ? (
        <Text style={{ color: colors.mutedForeground, fontSize: typography.caption, fontWeight: "600" }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
