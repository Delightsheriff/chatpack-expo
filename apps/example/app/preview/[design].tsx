import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { ConversationView } from "../../components/ConversationView";
import { findDesign } from "../../lib/designs";
import { ME, OTHER, SEED_MESSAGES, msg } from "../../lib/mockMessages";
import type { ChatMessage, ChatTypingIndicator } from "chatpack-expo-ui";

/** Offline conversation (no backend) in one of the demo designs. */
export default function DesignPreviewScreen() {
  const { design: key } = useLocalSearchParams<{ design: string }>();
  const design = findDesign(key);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [typing, setTyping] = useState<ChatTypingIndicator | null>(null);

  const update = (id: string, fn: (m: ChatMessage) => ChatMessage) => setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  return (
    <>
      <Stack.Screen options={{ title: design.name }} />
      <ConversationView
        currentUserId={ME}
        messages={messages}
        typing={typing}
        receipt={{ readMessageId: messages.findLast((m) => m.senderId === ME)?.id }}
        design={design}
        onSend={(body, replyTo) => {
          setMessages((prev) => [
            ...prev,
            msg({
              id: String(prev.length + 1),
              senderId: ME,
              body,
              createdAt: new Date().toISOString(),
              ...(replyTo ? { replyToMessageId: replyTo.id, replyTo: { id: replyTo.id, senderId: replyTo.senderId, excerpt: replyTo.body.slice(0, 140), deleted: false } } : null),
            }),
          ]);
          // Fake a reply so there's something to look at.
          setTimeout(() => setTyping({ senderId: OTHER, at: new Date().toISOString() }), 400);
          setTimeout(() => {
            setTyping(null);
            setMessages((prev) => [...prev, msg({ id: String(prev.length + 1), senderId: OTHER, body: "Got it 👍", createdAt: new Date().toISOString() })]);
          }, 1800);
        }}
        onReact={(id, emoji) =>
          update(id, (m) => {
            const existing = m.reactions.find((r) => r.emoji === emoji);
            const reactions = existing
              ? m.reactions.filter((r) => r.emoji !== emoji)
              : [...m.reactions, { emoji, count: 1, userIds: [ME] }];
            return { ...m, reactions };
          })
        }
        onDeleteMessage={(id) => update(id, (m) => ({ ...m, body: "", deletedAt: new Date().toISOString() }))}
      />
    </>
  );
}
