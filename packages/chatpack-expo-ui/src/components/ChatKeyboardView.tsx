import { createContext, forwardRef, useContext, useMemo, type ReactNode } from "react";
import { StyleSheet, View, type ScrollView, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  KeyboardAvoidingView,
  KeyboardChatScrollView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatTheme } from "../context/ChatUIProvider";
import { useSlots } from "../customization/useSlots";
import type { SlotProps } from "../customization/slots";

/**
 * How the transcript reacts when the keyboard opens (react-native-keyboard-controller's
 * `KeyboardLiftBehavior`):
 * - `"always"` — content always lifts with the keyboard (Telegram, WhatsApp).
 * - `"whenAtEnd"` — lifts only if the reader is at the latest message (ChatGPT).
 * - `"persistent"` — lifts on open, stays lifted on close (Claude).
 * - `"never"` — content never moves.
 */
export type KeyboardLiftBehavior = "always" | "whenAtEnd" | "persistent" | "never";

interface ChatKeyboardContextValue {
  mode: "chat" | "avoiding";
  bottomInset: number;
  liftBehavior: KeyboardLiftBehavior;
}

const ChatKeyboardContext = createContext<ChatKeyboardContextValue | null>(null);

/** The enclosing `ChatKeyboardView`'s settings, or `null` outside one. */
export function useChatKeyboard(): ChatKeyboardContextValue | null {
  return useContext(ChatKeyboardContext);
}

export interface ChatKeyboardViewProps extends SlotProps<"ChatKeyboardView"> {
  children: ReactNode;
  /**
   * - `"chat"` (default): the native chat pattern. `MessageScroller` renders on
   *   keyboard-controller's `KeyboardChatScrollView` (content lifts with the
   *   keyboard frame-by-frame, swipe down on the list to dismiss it
   *   interactively), and `ChatKeyboardView.Dock` sticks to the keyboard.
   * - `"avoiding"`: a keyboard-controller `KeyboardAvoidingView` around
   *   everything — for a transcript that isn't `MessageScroller`.
   */
  mode?: "chat" | "avoiding";
  /** See `KeyboardLiftBehavior`. Default `"always"`. `"chat"` mode only. */
  keyboardLiftBehavior?: KeyboardLiftBehavior;
  /**
   * Space between the bottom of this view and the bottom of the screen that
   * the keyboard covers — normally the bottom safe-area inset (the default).
   * Pass `0` when something like a tab bar already sits below the chat.
   */
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The keyboard layer of a conversation screen. Put the transcript and the
 * input area inside it:
 *
 * ```tsx
 * <ChatKeyboardView>
 *   <MessageScroller ItemComponent={Row} />
 *   <ChatKeyboardView.Dock>
 *     <TypingIndicator typing={typing} />
 *     <Composer onSend={send} />
 *   </ChatKeyboardView.Dock>
 * </ChatKeyboardView>
 * ```
 *
 * Built on react-native-keyboard-controller, so keyboard motion is synced
 * frame-by-frame on both platforms and Android needs no
 * `softwareKeyboardLayoutMode` setting. Requires `KeyboardProvider` (from
 * react-native-keyboard-controller) once at your app root, and a
 * `SafeAreaProvider` (Expo Router adds one for you).
 *
 * Slots: `root`.
 */
function ChatKeyboardViewRoot({
  children,
  mode = "chat",
  keyboardLiftBehavior = "always",
  bottomInset,
  style,
  className,
  styles: slotStyles,
  classNames,
}: ChatKeyboardViewProps) {
  const insets = useSafeAreaInsets();
  const slots = useSlots("ChatKeyboardView", { styles: slotStyles, classNames }, {});
  const resolvedInset = bottomInset ?? insets.bottom;
  const value = useMemo<ChatKeyboardContextValue>(
    () => ({ mode, bottomInset: resolvedInset, liftBehavior: keyboardLiftBehavior }),
    [mode, resolvedInset, keyboardLiftBehavior],
  );

  return (
    <ChatKeyboardContext.Provider value={value}>
      {mode === "avoiding" ? (
        <KeyboardAvoidingView
          behavior="padding"
          automaticOffset
          style={[styles.flex, slots.style("root"), style]}
          {...slots.className("root", className)}
        >
          {children}
        </KeyboardAvoidingView>
      ) : (
        <View style={[styles.flex, slots.style("root"), style]} {...slots.className("root", className)}>
          {children}
        </View>
      )}
    </ChatKeyboardContext.Provider>
  );
}

export interface ChatKeyboardDockProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The input area of a conversation — composer, reply preview, typing
 * indicator, anything that must stay above the keyboard. Pads itself by the
 * bottom safe-area inset while the keyboard is closed and sits flush on the
 * keyboard while it's open. Background: `colors.background`.
 */
function ChatKeyboardDock({ children, style, className }: ChatKeyboardDockProps) {
  const theme = useChatTheme();
  const keyboard = useChatKeyboard();
  const bottomInset = keyboard?.bottomInset ?? 0;
  const classNameProp = className === undefined ? {} : { className };

  if (keyboard?.mode === "avoiding") {
    return <AvoidingDock bottomInset={bottomInset} style={[{ backgroundColor: theme.colors.background }, style]} classNameProp={classNameProp}>{children}</AvoidingDock>;
  }

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: bottomInset }} enabled={keyboard !== null}>
      <View style={[{ backgroundColor: theme.colors.background, paddingBottom: bottomInset }, style]} {...classNameProp}>
        {children}
      </View>
    </KeyboardStickyView>
  );
}

/** In `"avoiding"` mode the view itself shrinks, so only the inset padding animates away as the keyboard opens. */
function AvoidingDock({
  bottomInset,
  style,
  classNameProp,
  children,
}: {
  bottomInset: number;
  style: StyleProp<ViewStyle>;
  classNameProp: { className?: string };
  children: ReactNode;
}) {
  const { progress } = useReanimatedKeyboardAnimation();
  const padding = useAnimatedStyle(() => ({ paddingBottom: bottomInset * (1 - progress.value) }));
  return (
    <Animated.View style={[style, padding]} {...classNameProp}>
      {children}
    </Animated.View>
  );
}

/**
 * `KeyboardChatScrollView` wired to the enclosing `ChatKeyboardView` — the
 * scroll component `MessageScroller` renders on in `"chat"` mode. Exported
 * for custom transcripts (pass it as a FlatList/FlashList/LegendList
 * `renderScrollComponent`).
 */
export const ChatKeyboardScrollView = forwardRef<ScrollView, ScrollViewProps>(function ChatKeyboardScrollView(props, ref) {
  const keyboard = useChatKeyboard();
  return (
    <KeyboardChatScrollView
      ref={ref as never}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      {...props}
      offset={keyboard?.bottomInset ?? 0}
      keyboardLiftBehavior={keyboard?.liftBehavior ?? "always"}
    />
  );
});

export const ChatKeyboardView = Object.assign(ChatKeyboardViewRoot, { Dock: ChatKeyboardDock });

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
