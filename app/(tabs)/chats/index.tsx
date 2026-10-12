import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useConversations } from "chatpack-expo/react";
import { ChatUIProvider, ConversationList, type ChatConversationSummary } from "chatpack-expo-ui";
import { DEMO_USERS } from "../../../lib/chat";
import { useChatSession } from "../../../lib/session";

/**
 * Two hardcoded rows mixed in with the real DMs the server creates on
 * mount. Fresh DMs always have unreadCount 0 for their own creator, so on
 * their own they can't exercise the unread-badge or read-receipt branches
 * of ConversationListItem.
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

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
];

export default function ChatsScreen() {
  const router = useRouter();
  const { chat, userId } = useChatSession();
  const { data, refetch, isRefetching } = useConversations(chat);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Find-or-create a DM with each other demo user so the list has content.
  useEffect(() => {
    for (const otherUserId of DEMO_USERS.filter((id) => id !== userId)) {
      chat.conversations.create({ otherUserId }).catch(() => {});
    }
  }, [chat, userId]);

  const summaries = useMemo<ChatConversationSummary[]>(() => {
    const real = (data?.conversations ?? []).map((conversation): ChatConversationSummary => {
      const other = conversation.participants.find((p) => p.userId !== userId);
      return {
        id: conversation.id,
        title: conversation.name ?? other?.userId ?? "Unknown",
        previewText: conversation.type === "direct" ? `DM with ${other?.userId ?? "?"}` : `Group · ${conversation.participants.length} members`,
        updatedAt: conversation.createdAt,
        unreadCount: conversation.unreadCount,
      };
    });
    return [...FIXTURE_CONVERSATIONS, ...real];
  }, [data, userId]);

  const visible = summaries
    .filter((c) => (filter === "unread" ? (c.unreadCount ?? 0) > 0 : filter === "groups" ? GROUP_FIXTURE_IDS.has(c.id) : true))
    .filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ChatUIProvider currentUserId={userId}>
      {/* Native header search (UISearchController / Material search) instead of an in-list field. */}
      <Stack.SearchBar placeholder="Search" onChangeText={(e) => setQuery(e.nativeEvent.text)} onCancelButtonPress={() => setQuery("")} />
      <ConversationList
        conversations={visible}
        onRefresh={() => void refetch()}
        refreshing={isRefetching}
        onPressConversation={(id) => {
          if (id.startsWith("fixture-")) {
            Alert.alert("Demo row", "Fixture data for visual testing — not a real conversation.");
            return;
          }
          const title = summaries.find((s) => s.id === id)?.title ?? "Conversation";
          router.push({ pathname: "/conversation/[id]", params: { id, title } });
        }}
        onLongPressConversation={(id) => Alert.alert("Conversation", undefined, [{ text: "Pin" }, { text: "Mute" }, { text: "Cancel", style: "cancel" }], { cancelable: true })}
        ListHeaderComponent={<ConversationList.FilterTabs tabs={FILTERS} activeKey={filter} onChange={setFilter} style={{ paddingVertical: 8 }} />}
      />
    </ChatUIProvider>
  );
}
