import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useChatConfig } from "../context/ChatUIProvider";

export interface UseComposerOptions {
  /** Called with the trimmed draft. The draft clears right after. */
  onSend: (body: string) => void;
  /** Controlled draft — pass with `onChangeText` to own the text (saved drafts, edit mode). */
  value?: string | undefined;
  onChangeText?: ((text: string) => void) | undefined;
  /** Initial draft when uncontrolled. */
  defaultValue?: string | undefined;
}

export interface UseComposerResult {
  value: string;
  setValue: (text: string) => void;
  /** The draft has non-whitespace text. */
  canSend: boolean;
  /** Sends the trimmed draft (no-op when `!canSend`), fires the `send` haptic, clears the draft. */
  send: () => void;
  clear: () => void;
  inputRef: React.RefObject<TextInput | null>;
}

/**
 * The composer's logic with no UI — draft state (controlled or not), the
 * can-send rule, send + haptic + clear. Use it to build a completely custom
 * input bar while keeping the package's behavior:
 *
 * ```tsx
 * const composer = useComposer({ onSend });
 * <TextInput ref={composer.inputRef} value={composer.value} onChangeText={composer.setValue} />
 * <MyButton disabled={!composer.canSend} onPress={composer.send} />
 * ```
 *
 * Deliberately tracks no focus state: a React state update in a
 * `TextInput`'s `onFocus` lands right before the keyboard event and can make
 * iOS skip the keyboard animation.
 */
export function useComposer({ onSend, value, onChangeText, defaultValue = "" }: UseComposerOptions): UseComposerResult {
  const { haptics } = useChatConfig();
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const draft = isControlled ? value : internal;
  const inputRef = useRef<TextInput | null>(null);

  const setValue = useCallback(
    (text: string) => {
      if (!isControlled) setInternal(text);
      onChangeText?.(text);
    },
    [isControlled, onChangeText],
  );

  const canSend = draft.trim().length > 0;

  const send = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    haptics("send");
    setValue("");
  }, [draft, onSend, haptics, setValue]);

  const clear = useCallback(() => setValue(""), [setValue]);

  return { value: draft, setValue, canSend, send, clear, inputRef };
}
