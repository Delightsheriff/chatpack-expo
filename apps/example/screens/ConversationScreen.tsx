import { createContext, memo, useCallback, useContext, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ChatClient } from "@chatpack/client";
import { useOptimisticMessages, useReceipts, useTyping } from "chatpack-expo/react";
import {
  Avatar,
  BubbleQuote,
  BubbleReactions,
  ChatKeyboardView,
  ChatUIProvider,
  Composer,
  Marker,
  Message,
  MessageActionsSheet,
  MessageScroller,
  MessageScrollerItem,
  MessageScrollerProvider,
  ReadReceipt,
  SwipeToReply,
  TypingIndicator,
  formatDateMarker,
  isDifferentCalendarDay,
  resolveReceiptStatus,
  useChatUI,
  useMessageScroller,
  type ChatMessage,
  type ChatReceiptState,
  type MessageItemProps,
} from "chatpack-expo-ui";

export interface ConversationScreenProps {
  chat: ChatClient;
  currentUserId: string;
  conversationId: string;
  title: string;
  onBack: () => void;
}

const ReceiptContext = createContext<ChatReceiptState | null>(null);

const MessageRow = memo(function MessageRow({
  message,
  previousMessage,
  nextMessage,
  isAnchor,
}: MessageItemProps) {
  const { actions: chatActions, state } = useChatUI();
  const { scrollToMessage } = useMessageScroller();
  const receipt = useContext(ReceiptContext);

  const isOwnLastMessage = !nextMessage && message.senderId === state.currentUserId;

  return (
    <MessageScrollerItem messageId={message.id} scrollAnchor={isAnchor}>
      {isDifferentCalendarDay(previousMessage, message) && (
        <Marker variant="separator">
          <Marker.Content>{formatDateMarker(new Date(message.createdAt))}</Marker.Content>
        </Marker>
      )}
      <SwipeToReply onReply={() => chatActions.onReply?.(message.id)}>
        <Message message={message} previousMessage={previousMessage} nextMessage={nextMessage}>
          <Message.Avatar>
            <Avatar name={message.senderId} size={28} />
          </Message.Avatar>
          <Message.Content>
            <Message.Header>{message.senderId}</Message.Header>
            <Message.Bubble
              // Open action sheet at screen level on long press
              onLongPress={() => chatActions.onOpenActions?.(message)}
              quote={
                message.replyTo && (
                  <BubbleQuote
                    replyTo={message.replyTo}
                    senderLabel={message.replyTo.senderId}
                    onPress={() => scrollToMessage(message.replyTo!.id)}
                  />
                )
              }
              reactions={
                message.reactions.length > 0 && (
                  <BubbleReactions>
                    {message.reactions.map((r) => (
                      <Pressable
                        key={r.emoji}
                        onPress={() => chatActions.onReact?.(message.id, r.emoji)}
                      >
                        <Text>
                          {r.emoji} {r.count}
                        </Text>
                      </Pressable>
                    ))}
                  </BubbleReactions>
                )
              }
            />
            {isOwnLastMessage && (
              <Message.Footer>
                <ReadReceipt status={resolveReceiptStatus(message, receipt)} variant="icon" />
              </Message.Footer>
            )}
          </Message.Content>
        </Message>
      </SwipeToReply>
    </MessageScrollerItem>
  );
});

export function ConversationScreen({
  chat,
  currentUserId,
  conversationId,
  title,
  onBack,
}: ConversationScreenProps) {
  // Instant WhatsApp-style optimistic messages hook
  const { messages, sendMessage, loadMore } = useOptimisticMessages(chat, {
    conversationId,
    currentUserId,
  });

  const typing = useTyping(chat, { conversationId });
  const receipt = useReceipts(chat, { conversationId }) as ChatReceiptState | null;
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);

  // Single screen-level state for MessageActionsSheet (eliminates 50 duplicate modals)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  // Instant 0ms send
  const handleSend = useCallback(
    (body: string) => {
      void sendMessage(body, {
        replyToMessageId: replyTarget?.id,
      });
      setReplyTarget(null);
    },
    [sendMessage, replyTarget],
  );

  const handleReply = useCallback(
    (messageId: string) => {
      const target = messages.find((m) => m.id === messageId) ?? null;
      setReplyTarget(target);
    },
    [messages],
  );

  const handleCopy = useCallback(
    (messageId: string) => {
      const target = messages.find((m) => m.id === messageId);
      console.log(`[copy] ${target?.body ?? messageId}`);
    },
    [messages],
  );

  const handleForward = useCallback(
    (messageId: string) => {
      chat.messages
        .forward({ messageId, toConversationId: conversationId })
        .catch((err) => console.warn("[forward] failed", err));
    },
    [chat, conversationId],
  );

  const receiptContextValue = useMemo(() => receipt, [receipt]);

  return (
    <ChatUIProvider
      currentUserId={currentUserId}
      onReply={handleReply}
      onReact={(messageId, emoji) =>
        chat.messages
          .react({ messageId, emoji })
          .catch((err) => console.warn("[react] failed", err))
      }
      onDeleteMessage={(messageId) =>
        chat.messages
          .delete({ messageId })
          .catch((err) => console.warn("[delete] failed", err))
      }
      onCopyMessage={handleCopy}
      onForwardMessage={handleForward}
      onOpenActions={(msg) => setSelectedMessage(msg)}
    >
      <View style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>‹ Chats</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ChatKeyboardView keyboardVerticalOffset={90}>
          <ReceiptContext.Provider value={receiptContextValue}>
            <MessageScrollerProvider messages={messages} scrollPreviousItemPeek={24} autoScroll>
              <MessageScroller ItemComponent={MessageRow} onLoadOlder={() => void loadMore()} />
            </MessageScrollerProvider>
          </ReceiptContext.Provider>

          <TypingIndicator typing={typing} />

          {replyTarget && (
            <View style={styles.replyPreview}>
              <Text numberOfLines={1} style={styles.replyPreviewText}>
                Replying to {replyTarget.senderId}: {replyTarget.body}
              </Text>
              <Pressable onPress={() => setReplyTarget(null)} hitSlop={8}>
                <Text style={styles.replyPreviewClose}>✕</Text>
              </Pressable>
            </View>
          )}

          <Composer onSend={handleSend} />
        </ChatKeyboardView>

        {/* ONE Action Sheet at the root level for the entire conversation */}
        <MessageActionsSheet
          message={selectedMessage}
          isPresented={selectedMessage !== null}
          onDismiss={() => setSelectedMessage(null)}
        />
      </View>
    </ChatUIProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  back: { fontSize: 16, color: "#3478f6", width: 64 },
  title: { flex: 1, textAlign: "center", fontWeight: "600", fontSize: 16 },
  headerSpacer: { width: 64 },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f2f2f2",
  },
  replyPreviewText: { flex: 1, fontSize: 12, color: "#555" },
  replyPreviewClose: { fontSize: 14, color: "#999", paddingHorizontal: 8 },
});
