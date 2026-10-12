/**
 * Design tokens. Plain values (not NativeWind classes) so this package works
 * in any RN app regardless of whether the host project uses NativeWind —
 * a library needing consumers to adopt a specific styling system is
 * friction the app author didn't ask for.
 *
 * Tokens are the first of three customization layers:
 *
 * 1. **Tokens** (this file) — colors, type, spacing, shape. Build a theme
 *    from a partial override with `createTheme`.
 * 2. **Slot styles** — every component exposes its inner parts by name via
 *    `styles`/`classNames` props, and app-wide via `theme.components`
 *    (see `src/customization/slots.ts`).
 * 3. **Overrides** — icons, labels, and whole sub-components are swappable
 *    on `ChatUIProvider` (see `src/customization`).
 */
import type { ChatComponentStyles } from "../customization/slots";

export interface ChatColors {
  background: string;
  surface: string;
  border: string;
  foreground: string;
  mutedForeground: string;
  bubbleSent: string;
  bubbleSentForeground: string;
  bubbleReceived: string;
  bubbleReceivedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  /** Tint of the read receipt icon ("blue ticks"). */
  receiptRead: string;
  /** Unread count badge background/foreground. */
  badge: string;
  badgeForeground: string;
  /** Presence dot for an online user. */
  online: string;
  /** Scrim behind modal sheets/menus. */
  overlay: string;
}

export interface ChatSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ChatRadius {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

export interface ChatTypography {
  body: number;
  caption: number;
  timestamp: number;
  /** Conversation/screen titles. */
  title: number;
  /** Emoji in reaction pickers. */
  emoji: number;
}

/**
 * Font family per weight. Custom fonts on Android usually ship one family
 * per weight (`Inter-Regular`, `Inter-SemiBold`, …) and ignore `fontWeight`,
 * so components pick the family for the weight they render at. Leave unset
 * to use the platform system font (SF Pro / Roboto).
 */
export interface ChatFonts {
  regular?: string | undefined;
  medium?: string | undefined;
  semibold?: string | undefined;
  bold?: string | undefined;
}

/** Shape of message bubbles — the part of a chat UI that varies most between designs. */
export interface ChatBubbleTokens {
  /** Corner radius of a standalone bubble. */
  radius: number;
  /** Corner radius on the side shared with an adjacent grouped bubble. Set equal to `radius` to disable the grouped look. */
  groupedRadius: number;
  /** Max width as a fraction of the row (0–1). */
  maxWidth: number;
  paddingHorizontal: number;
  paddingVertical: number;
}

export interface ChatAvatarTokens {
  /** Size inside a message row (`Message.Avatar`). */
  messageSize: number;
  /** Size in a conversation list row. */
  listSize: number;
  /** Corner radius; `radius.full` for circles, smaller for rounded squares. */
  radius: number;
}

export interface ChatTheme {
  colors: ChatColors;
  spacing: ChatSpacing;
  radius: ChatRadius;
  typography: ChatTypography;
  fonts: ChatFonts;
  bubble: ChatBubbleTokens;
  avatar: ChatAvatarTokens;
  /** App-wide slot style overrides per component — see `ChatComponentStyles`. */
  components: ChatComponentStyles;
}

const spacing: ChatSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radius: ChatRadius = { sm: 6, md: 12, lg: 18, full: 999 };
const typography: ChatTypography = { body: 16, caption: 13, timestamp: 11, title: 17, emoji: 22 };
const bubble: ChatBubbleTokens = { radius: 18, groupedRadius: 6, maxWidth: 0.8, paddingHorizontal: 12, paddingVertical: 8 };
const avatar: ChatAvatarTokens = { messageSize: 32, listSize: 48, radius: 999 };

export const lightTheme: ChatTheme = {
  spacing,
  radius,
  typography,
  fonts: {},
  bubble,
  avatar,
  components: {},
  colors: {
    background: "#FFFFFF",
    surface: "#F4F4F5",
    border: "#E4E4E7",
    foreground: "#18181B",
    mutedForeground: "#71717A",
    bubbleSent: "#18181B",
    bubbleSentForeground: "#FAFAFA",
    bubbleReceived: "#F4F4F5",
    bubbleReceivedForeground: "#18181B",
    accent: "#2563EB",
    accentForeground: "#FFFFFF",
    destructive: "#DC2626",
    receiptRead: "#34B7F1",
    badge: "#2563EB",
    badgeForeground: "#FFFFFF",
    online: "#22C55E",
    overlay: "rgba(0,0,0,0.4)",
  },
};

export const darkTheme: ChatTheme = {
  spacing,
  radius,
  typography,
  fonts: {},
  bubble,
  avatar,
  components: {},
  colors: {
    background: "#09090B",
    surface: "#18181B",
    border: "#27272A",
    foreground: "#FAFAFA",
    mutedForeground: "#A1A1AA",
    bubbleSent: "#FAFAFA",
    bubbleSentForeground: "#18181B",
    bubbleReceived: "#27272A",
    bubbleReceivedForeground: "#FAFAFA",
    accent: "#3B82F6",
    accentForeground: "#FFFFFF",
    destructive: "#EF4444",
    receiptRead: "#53BDEB",
    badge: "#3B82F6",
    badgeForeground: "#FFFFFF",
    online: "#22C55E",
    overlay: "rgba(0,0,0,0.6)",
  },
};

/** Recursively optional — what `createTheme` accepts. Functions and arrays are replaced, not merged. */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function deepMerge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    result[key] = deepMerge((base as Record<string, unknown>)[key], value as never);
  }
  return result as T;
}

/**
 * Builds a full `ChatTheme` from a partial override, deep-merged onto
 * `base` (default `lightTheme`). Pass `darkTheme` as the base for a dark
 * variant of the same brand:
 *
 * ```ts
 * const brand = { colors: { accent: "#7C3AED", bubbleSent: "#7C3AED" }, bubble: { radius: 22 } };
 * export const light = createTheme(brand);
 * export const dark = createTheme(brand, darkTheme);
 * ```
 *
 * Define themes at module scope — a new theme object every render
 * re-renders every chat component.
 */
export function createTheme(override: DeepPartial<ChatTheme> = {}, base: ChatTheme = lightTheme): ChatTheme {
  return deepMerge<ChatTheme>(base, override);
}
