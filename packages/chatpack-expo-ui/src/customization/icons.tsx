import type { ReactNode } from "react";
import { Platform, View, type ColorValue } from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { useChatConfig } from "../context/ChatUIProvider";

/**
 * Every icon the package draws itself. Swap any of them on
 * `ChatUIProvider`'s `icons` prop.
 */
export type ChatIconName =
  | "send"
  | "reply"
  | "copy"
  | "forward"
  | "delete"
  | "search"
  | "add"
  | "close"
  | "chevronDown"
  | "chevronUp"
  | "attach"
  | "camera"
  | "mic"
  | "react"
  | "receiptSending"
  | "receiptSent"
  | "receiptDelivered"
  | "receiptRead"
  | "receiptFailed";

export interface ChatIconProps {
  size: number;
  color: ColorValue;
}

/** Native symbol names per platform: SF Symbols on iOS, Material Symbols on Android and web. */
export interface ChatSymbolNames {
  ios?: string | undefined;
  android?: string | undefined;
  web?: string | undefined;
}

/**
 * How to draw one icon:
 * - a string — the same symbol name on every platform,
 * - `{ ios, android, web }` — per-platform native symbol names,
 * - a render function — anything at all (vector-icons, an SVG, an image).
 *
 * ```tsx
 * import { Feather } from "@expo/vector-icons";
 * <ChatUIProvider icons={{
 *   send: ({ size, color }) => <Feather name="send" size={size} color={color} />,
 *   reply: { ios: "arrowshape.turn.up.left.fill", android: "reply" },
 * }} />
 * ```
 */
export type ChatIconSource = string | ChatSymbolNames | ((props: ChatIconProps) => ReactNode);

export type ChatIcons = Record<ChatIconName, ChatIconSource>;

function DoubleCheck({ size, color }: ChatIconProps) {
  // SF Symbols has no double checkmark; Material does (`done_all`).
  if (Platform.OS !== "ios") {
    return <SymbolView name={{ android: "done_all", web: "done_all" }} size={size} tintColor={color} />;
  }
  return (
    <View style={{ width: size * 1.3, height: size, flexDirection: "row" }}>
      <SymbolView name="checkmark" size={size} tintColor={color} weight="semibold" />
      <View style={{ position: "absolute", left: size * 0.3 }}>
        <SymbolView name="checkmark" size={size} tintColor={color} weight="semibold" />
      </View>
    </View>
  );
}

export const defaultIcons: ChatIcons = {
  send: { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" },
  reply: { ios: "arrowshape.turn.up.left", android: "reply", web: "reply" },
  copy: { ios: "doc.on.doc", android: "content_copy", web: "content_copy" },
  forward: { ios: "arrowshape.turn.up.right", android: "forward", web: "forward" },
  delete: { ios: "trash", android: "delete", web: "delete" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  add: { ios: "plus", android: "add", web: "add" },
  close: { ios: "xmark", android: "close", web: "close" },
  chevronDown: { ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" },
  chevronUp: { ios: "chevron.up", android: "keyboard_arrow_up", web: "keyboard_arrow_up" },
  attach: { ios: "paperclip", android: "attach_file", web: "attach_file" },
  camera: { ios: "camera", android: "photo_camera", web: "photo_camera" },
  mic: { ios: "mic", android: "mic", web: "mic" },
  react: { ios: "face.smiling", android: "add_reaction", web: "add_reaction" },
  receiptSending: { ios: "clock", android: "schedule", web: "schedule" },
  receiptSent: { ios: "checkmark", android: "check", web: "check" },
  receiptDelivered: DoubleCheck,
  receiptRead: DoubleCheck,
  receiptFailed: { ios: "exclamationmark.circle", android: "error", web: "error" },
};

export interface ChatIconComponentProps {
  name: ChatIconName;
  size?: number;
  color: ColorValue;
}

/**
 * Renders a package icon through the provider's icon map — use it in your
 * own custom pieces so they pick up the same icon set as everything else.
 */
export function ChatIcon({ name, size = 18, color }: ChatIconComponentProps) {
  const { icons } = useChatConfig();
  const source = icons[name];
  if (typeof source === "function") return <>{source({ size, color })}</>;
  const names: ChatSymbolNames = typeof source === "string" ? { ios: source, android: source, web: source } : source;
  return (
    <SymbolView
      name={{ ios: names.ios as SFSymbol, android: names.android as never, web: names.web as never }}
      size={size}
      tintColor={color}
      fallback={null}
    />
  );
}
