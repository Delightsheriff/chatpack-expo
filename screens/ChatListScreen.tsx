import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import type { ChatClient } from "@chatpack/client";
import { useConversations } from "chatpack-expo/react";
import { ChatUIProvider, ConversationList, type ChatConversationSummary } from "chatpack-expo-ui";
import { DEMO_USERS } from "../lib/chat";

/**
 * Two hardcoded rows mixed in with the real alice/bob/carol/dave DMs the
 * server creates on mount. The real conversations are all fresh direct
 * messages the current user just created (unreadCount always 0 for their
 * own view), so on their own they can't exercise the unread-badge or
 * read-receipt-icon branches of ConversationListItem. These fixtures give
 * that visual coverage without inventing a fake backend.
 */
const FIXTURE_CONVERSATIONS: ChatConversationSummary[] = [
  {
    id: "fixture-design-team",
    title: "Design Team",
    previewText: "Sent the new mockups 🎉",
    updatedAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    unreadCount: 4,
  },
  {
    id: "fixture-mom",
    title: "Mom",
    previewText: "Call me when you can",
    updatedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    receiptStatus: "read",
  },
];
const GROUP_FIXTURE_IDS = new Set(["fixture-design-team"]);

export interface ChatListScreenProps {
  chat: ChatClient;
  currentUserId: string;
  onOpenConversation: (conversationId: string, title: string) => void;
}

export function ChatListScreen({ chat, currentUserId, onOpenConversation }: ChatListScreenProps) {
  const { data } = useConversations(chat);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Find-or-create a DM with each other demo user so the list has real,
  // varied content beyond the single alice/bob conversation the
  // transport-layer harness created. `conversations.create` is a
  // find-or-create keyed on the participant pair, so this is safe to run
  // on every mount/user switch.
  useEffect(() => {
    const others = DEMO_USERS.filter((id) => id !== currentUserId);
    others.forEach((otherUserId) => {
      chat.conversations.create({ otherUserId }).catch(() => {
        // Best-effort — a failure here just means one fewer demo row.
      });
    });
  }, [chat, currentUserId]);

  const contacts = useMemo(
    () => DEMO_USERS.filter((id) => id !== currentUserId).map((id) => ({ id, name: id })),
    [currentUserId],
  );

  const summaries = useMemo<ChatConversationSummary[]>(() => {
    const real = (data?.conversations ?? []).map((conversation): ChatConversationSummary => {
      const other = conversation.participants.find((p) => p.userId !== currentUserId);
      return {
        id: conversation.id,
        title: conversation.name ?? other?.userId ?? "Unknown",
        previewText: conversation.type === "direct" ? `DM with ${other?.userId ?? "?"}` : `Group · ${conversation.participants.length} members`,
        updatedAt: conversation.createdAt,
        unreadCount: conversation.unreadCount,
      };
    });
    return [...FIXTURE_CONVERSATIONS, ...real];
  }, [data, currentUserId]);

  const filtered = summaries
    .filter((c) => (filter === "unread" ? (c.unreadCount ?? 0) > 0 : filter === "groups" ? GROUP_FIXTURE_IDS.has(c.id) : true))
    .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <ChatUIProvider currentUserId={currentUserId}>
      <View style={styles.container}>
        <ConversationList
          conversations={filtered}
          onPressConversation={(id) => {
            if (id.startsWith("fixture-")) {
              Alert.alert("Demo row", "This is fixture data for visual testing — not a real conversation.");
              return;
            }
            const summary = summaries.find((s) => s.id === id);
            onOpenConversation(id, summary?.title ?? "Conversation");
          }}
          ListHeaderComponent={
            <>
              <ConversationList.StoryRow items={contacts} onPressAdd={() => Alert.alert("New chat", "Not wired in this test harness.")} />
              <ConversationList.SearchBar value={query} onChangeText={setQuery} />
              <ConversationList.FilterTabs
                tabs={[
                  { key: "all", label: "All" },
                  { key: "unread", label: "Unread" },
                  { key: "groups", label: "Groups" },
                ]}
                activeKey={filter}
                onChange={setFilter}
              />
            </>
          }
        />
      </View>
    </ChatUIProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
