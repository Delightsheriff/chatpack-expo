import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

/**
 * Moments the package gives tactile feedback for. Each maps to the native
 * haptic a first-party messaging app uses for the same gesture.
 */
export type ChatHapticEvent =
  /** A message was sent from the composer. */
  | "send"
  /** A long-press opened a menu/sheet for a message. */
  | "longPress"
  /** A swipe-to-reply crossed its commit threshold. */
  | "swipeReply"
  /** A reaction was picked. */
  | "reaction"
  /** A discrete choice changed (filter tab, picker). */
  | "selection"
  /** Text was copied to the clipboard. */
  | "copy";

export type ChatHaptics = (event: ChatHapticEvent) => void;

/**
 * The default haptic map (expo-haptics). Wrap it to change individual
 * events while keeping the rest:
 *
 * ```tsx
 * <ChatUIProvider haptics={(event) => event !== "send" && defaultHaptics(event)} />
 * ```
 */
export const defaultHaptics: ChatHaptics = (event) => {
  switch (event) {
    case "send":
    case "swipeReply":
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(noop);
      return;
    case "longPress":
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(noop);
      return;
    case "reaction":
    case "selection":
      void Haptics.selectionAsync().catch(noop);
      return;
    case "copy":
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(noop);
      return;
  }
};

export const noHaptics: ChatHaptics = noop;

/** Writes text to the system clipboard. Default: expo-clipboard. */
export type ChatCopyText = (text: string) => void | Promise<unknown>;

export const defaultCopyText: ChatCopyText = (text) => Clipboard.setStringAsync(text);

function noop(): void {}
