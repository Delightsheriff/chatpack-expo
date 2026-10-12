import type { StyleProp, ViewStyle } from "react-native";
import { useChatUI } from "../../context/ChatUIProvider";
import { QuickReactionBar } from "../QuickReactionBar";
import { useMessageContext } from "./context";

export interface MessageQuickReactionsProps {
  isVisible: boolean;
  onDismiss: () => void;
  emojis?: string[];
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * `QuickReactionBar` pre-wired to the enclosing `<Message>`'s id and
 * `ChatUIProvider`'s `onReact` — the convenience version of the pattern
 * documented on `QuickReactionBar` itself, for the common case where you
 * just want "long-press this bubble → react to *this* message" without
 * threading the message id through yourself. Renders nothing if `onReact`
 * isn't wired, same as the rest of this package's action affordances.
 */
export function MessageQuickReactions({ isVisible, onDismiss, emojis, style, className }: MessageQuickReactionsProps) {
  const { actions } = useChatUI();
  const { message } = useMessageContext();

  if (!isVisible || !actions.onReact) return null;

  return (
    <QuickReactionBar
      emojis={emojis}
      style={style}
      className={className}
      onSelect={(emoji) => {
        actions.onReact?.(message.id, emoji);
        onDismiss();
      }}
    />
  );
}
