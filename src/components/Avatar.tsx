import { useState } from "react";
import { Text, View, type StyleProp, type ViewStyle, type ImageStyle } from "react-native";
import { Image } from "expo-image";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export interface AvatarProps {
  uri?: string | undefined;
  /** Used for the initials fallback shown when there's no `uri`, or the image fails to load. */
  name?: string | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function initialsFrom(name: string | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * A small, deep component: every usage example elsewhere in this package
 * (and the shadcn docs it's ported from) assumes *some* avatar component
 * exists — this is that component, not previously built. Small interface
 * (`uri`, `name`, `size`), hides the actual complexity: falling back to
 * initials when there's no image, or the image fails to load.
 */
export function Avatar({ uri, name, size = 40, style, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const { state } = useChatUI();
  const { colors, radius } = state.theme;
  const showFallback = !uri || failed;

  if (showFallback) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius.full,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
        {...classNameProps(className)}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: size * 0.4, fontWeight: "600" }}>{initialsFrom(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius: radius.full, backgroundColor: colors.surface }, style as StyleProp<ImageStyle>]}
      onError={() => setFailed(true)}
      transition={150}
      {...classNameProps(className)}
    />
  );
}
