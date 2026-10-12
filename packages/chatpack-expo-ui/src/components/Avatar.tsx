import { useState } from "react";
import { Text, View, type StyleProp, type ViewStyle, type ImageStyle } from "react-native";
import { Image } from "expo-image";
import { useChatUI } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import { fontStyle } from "../customization/resolveSlots";
import type { SlotProps } from "../customization/slots";

export interface AvatarProps extends SlotProps<"Avatar"> {
  uri?: string | undefined;
  /** Used for the initials fallback shown when there's no `uri`, or the image fails to load. */
  name?: string | undefined;
  /** Defaults to `theme.avatar.listSize`. */
  size?: number | undefined;
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
 * Avatar with expo-image (cached, fades in) and an initials fallback.
 * Corner radius from `theme.avatar.radius` — circles by default, rounded
 * squares with a smaller value.
 *
 * Slots: `root`, `image`, `initials`. Replace app-wide with
 * `components={{ Avatar: MyAvatar }}`.
 */
export function Avatar({ uri, name, size, style, className, styles: slotStyles, classNames }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const { state } = useChatUI();
  const theme = state.theme;
  const { colors } = theme;
  const resolvedSize = size ?? theme.avatar.listSize;
  const showFallback = !uri || failed;
  const slots = useSlots("Avatar", { styles: slotStyles, classNames }, { hasImage: !showFallback, size: resolvedSize });
  const frame = { width: resolvedSize, height: resolvedSize, borderRadius: Math.min(theme.avatar.radius, resolvedSize / 2) };

  if (showFallback) {
    return (
      <View
        accessibilityLabel={name}
        style={[frame, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }, slots.style("root"), style]}
        {...slots.className("root", className)}
      >
        <Text
          style={[{ color: colors.mutedForeground, fontSize: resolvedSize * 0.4 }, fontStyle(theme, "semibold"), slots.style("initials")]}
          {...slots.className("initials")}
        >
          {initialsFrom(name)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[frame, { overflow: "hidden" }, slots.style("root"), style]} {...slots.className("root", className)}>
      <Image
        source={{ uri }}
        accessibilityLabel={name}
        style={[frame, { backgroundColor: colors.surface }, slots.style("image") as StyleProp<ImageStyle>]}
        onError={() => setFailed(true)}
        transition={150}
        {...slots.className("image")}
      />
    </View>
  );
}
