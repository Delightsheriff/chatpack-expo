import { createContext, memo, useContext } from "react";
import { Pressable, Text } from "react-native";
import {
  Avatar,
  BubbleQuote,
  BubbleReactions,
  Marker,
  Message,
  MessageScrollerItem,
  ReadReceipt,
  SwipeToReply,
  formatDateMarker,
  formatTimestamp,
  isDifferentCalendarDay,
  resolveReceiptStatus,
  useChatUI,
  useMessageScroller,
  type ChatReceiptState,
  type MessageItemProps,
} from "chatpack-expo-ui";

/**
 * Per-screen settings for `MessageRow`. Kept in context (not props) because
 * `MessageScroller` renders rows from a stable component reference.
 */
export interface MessageRowConfig {
  receipt: ChatReceiptState | null;
  /** Your most recent message — the only one that shows a read receipt. */
  lastOwnMessageId: string | null;
  /** Avatar + name next to received messages. */
  showSender: boolean;
  /** Left-align everyone (Slack-style). */
  flat: boolean;
}

export const MessageRowContext = createContext<MessageRowConfig>({ receipt: null, lastOwnMessageId: null, showSender: true, flat: false });

/**
 * One transcript row, composed from the package's parts: date separator,
 * swipe-to-reply, avatar, name, bubble with quote + reactions, and a read
 * receipt under your latest message. Copy this into an app and edit freely —
 * it's app code, not package code.
 */
export const MessageRow = memo(function MessageRow({ message, previousMessage, nextMessage, isAnchor }: MessageItemProps) {
  const { actions, state } = useChatUI();
  const { scrollToMessage } = useMessageScroller();
  const { receipt, lastOwnMessageId, showSender, flat } = useContext(MessageRowContext);
  const { colors, typography } = state.theme;

  const isOwn = message.senderId === state.currentUserId;
  const isLatestOwn = message.id === lastOwnMessageId;
  const showName = showSender && (flat || !isOwn) && previousMessage?.senderId !== message.senderId;

  return (
    <MessageScrollerItem messageId={message.id} scrollAnchor={isAnchor}>
      {isDifferentCalendarDay(previousMessage, message) && (
        <Marker variant="separator">
          <Marker.Content>{formatDateMarker(new Date(message.createdAt))}</Marker.Content>
        </Marker>
      )}
      <SwipeToReply onReply={() => actions.onReply?.(message.id)} direction={isOwn && !flat ? "start" : "end"}>
        <Message message={message} previousMessage={previousMessage} nextMessage={nextMessage} {...(flat ? { align: "start" as const } : null)}>
          {showSender && (flat || !isOwn) && (
            <Message.Avatar>
              <Avatar name={message.senderId} size={state.theme.avatar.messageSize} />
            </Message.Avatar>
          )}
          <Message.Content>
            {showName && (
              <Message.Header>
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: typography.caption + 1 }}>
                  {message.senderId}
                  {flat && <Text style={{ color: colors.mutedForeground, fontWeight: "400" }}>  {formatTimestamp(new Date(message.createdAt))}</Text>}
                </Text>
              </Message.Header>
            )}
            <Message.Bubble
              onLongPress={() => actions.onOpenActions?.(message)}
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
                  <BubbleReactions align={isOwn && !flat ? "end" : "start"}>
                    {message.reactions.map((r) => (
                      <Pressable key={r.emoji} hitSlop={4} onPress={() => actions.onReact?.(message.id, r.emoji)}>
                        <Text style={{ fontSize: 13, color: colors.foreground }}>
                          {r.emoji}
                          {r.count > 1 ? ` ${r.count}` : ""}
                        </Text>
                      </Pressable>
                    ))}
                  </BubbleReactions>
                )
              }
            />
            {(isLatestOwn || message.reactions.length > 0) && (
              <Message.Footer style={message.reactions.length > 0 ? { marginTop: 14 } : undefined}>
                {isLatestOwn && <ReadReceipt status={resolveReceiptStatus(message, receipt)} variant="icon" />}
              </Message.Footer>
            )}
          </Message.Content>
        </Message>
      </SwipeToReply>
    </MessageScrollerItem>
  );
});
