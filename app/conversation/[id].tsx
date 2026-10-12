import { useCallback, useRef } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useOptimisticMessages, useReceipts, useTyping } from "chatpack-expo/react";
import type { ChatReceiptState } from "chatpack-expo-ui";
import { ConversationView } from "../../components/ConversationView";
import { DESIGNS } from "../../lib/designs";
import { useChatSession } from "../../lib/session";

const TYPING_THROTTLE_MS = 3000;

/** A live conversation against the local Chatpack server. */
export default function ConversationScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const { chat, userId } = useChatSession();
  const { messages, sendMessage, loadMore } = useOptimisticMessages(chat, { conversationId: id, currentUserId: userId });
  const typing = useTyping(chat, { conversationId: id });
  const receipt = useReceipts(chat, { conversationId: id }) as ChatReceiptState | null;

  const lastTypingAt = useRef(0);
  const handleTyping = useCallback(
    (text: string) => {
      const now = Date.now();
      if (text.length === 0 || now - lastTypingAt.current < TYPING_THROTTLE_MS) return;
      lastTypingAt.current = now;
      chat.typing?.start({ conversationId: id }).catch(() => {});
    },
    [chat, id],
  );

  return (
    <>
      <Stack.Screen options={{ title: title ?? "Conversation" }} />
      <ConversationView
        currentUserId={userId}
        messages={[...messages].reverse()}
        typing={typing}
        receipt={receipt}
        design={DESIGNS[0]!}
        onSend={(body, replyTo) => {
          void sendMessage(body, { replyToMessageId: replyTo?.id });
          lastTypingAt.current = 0;
          chat.typing?.stop({ conversationId: id }).catch(() => {});
        }}
        onLoadOlder={() => void loadMore()}
        onTypingChange={handleTyping}
        onReact={(messageId, emoji) => void chat.messages.react({ messageId, emoji })}
        onDeleteMessage={(messageId) => void chat.messages.delete({ messageId })}
      />
    </>
  );
}
