import { useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type ChatTheme } from "../theme/tokens";
import { createRequiredContext } from "../utils/createRequiredContext";

/**
 * Everything a message-level component needs to know but shouldn't fetch or
 * derive itself: who's viewing, and what to render as. Kept separate from
 * `ChatUIActions` per `state-context-interface` — state and actions are two
 * different reasons to re-render, and a component that only reads actions
 * (stable callbacks) shouldn't re-subscribe when `currentUserId` changes.
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
 */
export interface ChatUIActions {
  onReply?: ((messageId: string) => void) | undefined;
  onReact?: ((messageId: string, emoji: string) => void) | undefined;
  onDeleteMessage?: ((messageId: string) => void) | undefined;
  onCopyMessage?: ((messageId: string) => void) | undefined;
  onOpenAttachment?: ((attachmentId: string, messageId: string) => void) | undefined;
}

interface ChatUIContextValue {
  state: ChatUIState;
  actions: ChatUIActions;
}

const [ChatUIContext, useChatUI] = createRequiredContext<ChatUIContextValue>("ChatUIProvider");

export interface ChatUIProviderProps extends ChatUIActions {
  currentUserId: string;
  /** Defaults to the light/dark token set matching the device color scheme. */
  theme?: ChatTheme;
  children: ReactNode;
}

export function ChatUIProvider({
  currentUserId,
  theme,
  onReply,
  onReact,
  onDeleteMessage,
  onCopyMessage,
  onOpenAttachment,
  children,
}: ChatUIProviderProps) {
  const colorScheme = useColorScheme();

  const value = useMemo<ChatUIContextValue>(
    () => ({
      state: { currentUserId, theme: theme ?? (colorScheme === "dark" ? darkTheme : lightTheme) },
      actions: { onReply, onReact, onDeleteMessage, onCopyMessage, onOpenAttachment },
    }),
    [currentUserId, theme, colorScheme, onReply, onReact, onDeleteMessage, onCopyMessage, onOpenAttachment],
  );

  return <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>;
}

export { useChatUI };
