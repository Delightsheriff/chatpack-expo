import { useMemo, type ComponentType, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type ChatTheme } from "../theme/tokens";
import { createRequiredContext } from "../utils/createRequiredContext";
import type { ChatMessage } from "../types";
import { resolveLabels, type ChatLabelOverrides, type ChatLabels } from "../customization/labels";
import { defaultIcons, type ChatIcons } from "../customization/icons";
import { defaultCopyText, defaultHaptics, noHaptics, type ChatCopyText, type ChatHaptics } from "../customization/feedback";
import type { ChatComponentOverrides } from "../customization/components";

/**
 * Everything a message-level component needs to know but shouldn't fetch or
 * derive itself: who's viewing, and what to render as. Kept separate from
 * `ChatUIActions` — state and actions are two different reasons to
 * re-render, and a component that only reads actions (stable callbacks)
 * shouldn't care when `currentUserId` changes.
 */
export interface ChatUIState {
  currentUserId: string;
  theme: ChatTheme;
}

/**
 * Interaction hooks. All optional — a consumer wires only what their app
 * supports (e.g. omit `onReact` if reactions aren't enabled), and components
 * that offer these interactions (long-press menu, reaction bar) simply don't
 * render that affordance when the corresponding action is absent, instead of
 * taking a parallel `enableReactions` boolean.
 *
 * Copy is the exception: it needs no backend, so it's on by default (system
 * clipboard via `copyText`). Pass `onCopyMessage` to replace it.
 */
export interface ChatUIActions {
  onReply?: ((messageId: string) => void) | undefined;
  onReact?: ((messageId: string, emoji: string) => void) | undefined;
  onDeleteMessage?: ((messageId: string) => void) | undefined;
  onCopyMessage?: ((messageId: string) => void) | undefined;
  onForwardMessage?: ((messageId: string) => void) | undefined;
  onOpenAttachment?: ((attachmentId: string, messageId: string) => void) | undefined;
  onOpenActions?: ((message: ChatMessage) => void) | undefined;
}

/** Resolved customization: what components read via `useChatConfig()`. */
export interface ChatUIConfig {
  labels: ChatLabels;
  icons: ChatIcons;
  components: Partial<ChatComponentOverrides>;
  haptics: ChatHaptics;
  copyText: ChatCopyText;
}

interface ChatUIContextValue {
  state: ChatUIState;
  actions: ChatUIActions;
  config: ChatUIConfig;
}

const [ChatUIContext, useChatUI] = createRequiredContext<ChatUIContextValue>("ChatUIProvider");

export interface ChatUIProviderProps extends ChatUIActions {
  currentUserId: string;
  /**
   * One theme, or a light/dark pair that follows the device appearance.
   * Defaults to `{ light: lightTheme, dark: darkTheme }`. Build themes with
   * `createTheme` at module scope.
   */
  theme?: ChatTheme | { light: ChatTheme; dark: ChatTheme } | undefined;
  /** Override any user-visible string (copy changes or localization). */
  labels?: ChatLabelOverrides | undefined;
  /** Override any icon — native symbol names or a render function. */
  icons?: Partial<ChatIcons> | undefined;
  /** Replace sub-components the package renders internally (Avatar, SendButton, …). */
  components?: Partial<ChatComponentOverrides> | undefined;
  /** Haptic feedback. Default: native haptics via expo-haptics. `false` disables. */
  haptics?: ChatHaptics | false | undefined;
  /** Clipboard writer used by the built-in Copy action. Default: expo-clipboard. */
  copyText?: ChatCopyText | undefined;
  children: ReactNode;
}

function isThemePair(theme: ChatUIProviderProps["theme"]): theme is { light: ChatTheme; dark: ChatTheme } {
  return theme !== undefined && "light" in theme && "dark" in theme;
}

/**
 * Root of every chat screen. Pass objects (`theme`, `labels`, `icons`,
 * `components`) from module scope or `useMemo` — an inline object literal
 * is a new value each render and re-renders every chat component below.
 */
export function ChatUIProvider({
  currentUserId,
  theme,
  labels,
  icons,
  components,
  haptics,
  copyText,
  onReply,
  onReact,
  onDeleteMessage,
  onCopyMessage,
  onForwardMessage,
  onOpenAttachment,
  onOpenActions,
  children,
}: ChatUIProviderProps) {
  const colorScheme = useColorScheme();

  const resolvedTheme = useMemo(() => {
    const pair = theme === undefined ? { light: lightTheme, dark: darkTheme } : isThemePair(theme) ? theme : null;
    if (pair) return colorScheme === "dark" ? pair.dark : pair.light;
    return theme as ChatTheme;
  }, [theme, colorScheme]);

  const config = useMemo<ChatUIConfig>(
    () => ({
      labels: resolveLabels(labels),
      icons: icons ? { ...defaultIcons, ...icons } : defaultIcons,
      components: components ?? {},
      haptics: haptics === false ? noHaptics : (haptics ?? defaultHaptics),
      copyText: copyText ?? defaultCopyText,
    }),
    [labels, icons, components, haptics, copyText],
  );

  const value = useMemo<ChatUIContextValue>(
    () => ({
      state: { currentUserId, theme: resolvedTheme },
      actions: { onReply, onReact, onDeleteMessage, onCopyMessage, onForwardMessage, onOpenAttachment, onOpenActions },
      config,
    }),
    [currentUserId, resolvedTheme, config, onReply, onReact, onDeleteMessage, onCopyMessage, onForwardMessage, onOpenAttachment, onOpenActions],
  );

  return <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>;
}

export { useChatUI };

/** The resolved labels/icons/components/haptics/clipboard from the nearest `ChatUIProvider`. */
export function useChatConfig(): ChatUIConfig {
  return useChatUI().config;
}

/** The active theme from the nearest `ChatUIProvider`. */
export function useChatTheme(): ChatTheme {
  return useChatUI().state.theme;
}

/**
 * The component to render for an overridable sub-component — the app's
 * override from `ChatUIProvider`'s `components` prop, or `fallback`.
 */
export function useChatComponent<K extends keyof ChatComponentOverrides>(
  name: K,
  fallback: ChatComponentOverrides[K],
): ChatComponentOverrides[K] {
  const override = useChatUI().config.components[name];
  return (override ?? fallback) as ChatComponentOverrides[K] & ComponentType<never>;
}
