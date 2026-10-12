/**
 * Design tokens ported from shadcn/ui's neutral palette and spacing scale.
 * Plain values (not NativeWind classes) so this package works in any RN
 * app regardless of whether the host project uses NativeWind, per
 * `ui-styling` — a library needing consumers to adopt a specific styling
 * system is friction the app author didn't ask for.
 */

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
}

export interface ChatTheme {
  colors: ChatColors;
  spacing: ChatSpacing;
  radius: ChatRadius;
  typography: ChatTypography;
}

const spacing: ChatSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radius: ChatRadius = { sm: 6, md: 12, lg: 18, full: 999 };
const typography: ChatTypography = { body: 16, caption: 13, timestamp: 11 };

export const lightTheme: ChatTheme = {
  spacing,
  radius,
  typography,
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
  },
};

export const darkTheme: ChatTheme = {
  spacing,
  radius,
  typography,
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
  },
};
