import { useCallback, useEffect, useRef } from "react";
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

  // Mark the conversation read up to the newest server message while this
  // screen is open — on open and again as new messages arrive. Clears the
  // unread badge in the list and the tab bar, and sends the other side ✓✓.
  const newestServerId = messages.find((m) => !m.isOptimistic)?.id;
  const lastMarked = useRef<string | null>(null);
  useEffect(() => {
    if (!newestServerId || lastMarked.current === newestServerId) return;
    lastMarked.current = newestServerId;
    // Chatpack actions report failures in `error` rather than throwing; retry on the next change.
    void chat.conversations
      .markRead({ conversationId: id, messageId: newestServerId })
      .then((result) => {
        if (result.error) lastMarked.current = null;
      })
      .catch(() => {
        lastMarked.current = null;
      });
  }, [chat, id, newestServerId]);

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
