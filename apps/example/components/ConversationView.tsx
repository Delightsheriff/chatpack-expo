import { useCallback, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import {
  ChatKeyboardView,
  ChatUIProvider,
  Composer,
  MessageActionsSheet,
  MessageScroller,
  MessageScrollerProvider,
  TypingIndicator,
  useChatTheme,
  type ChatMessage,
  type ChatReceiptState,
  type ChatTypingIndicator,
  type ChatUIActions,
} from "chatpack-expo-ui";
import type { ChatDesign } from "../lib/designs";
import { MessageRow, MessageRowContext } from "./MessageRow";
import { ReplyBar } from "./ReplyBar";

export interface ConversationViewProps extends Omit<ChatUIActions, "onReply" | "onOpenActions"> {
  currentUserId: string;
  /** Oldest first. */
  messages: ChatMessage[];
  typing: ChatTypingIndicator | null;
  receipt: ChatReceiptState | null;
  design: ChatDesign;
  onSend: (body: string, replyTo: ChatMessage | null) => void;
  onLoadOlder?: () => void;
  onTypingChange?: (text: string) => void;
}

/**
 * A full conversation screen body, composed from chatpack-expo-ui parts:
 * keyboard layer, transcript, dock (typing + reply bar + composer) and one
 * screen-level actions sheet.
 */
export function ConversationView({
  currentUserId,
  messages,
  typing,
  receipt,
  design,
  onSend,
  onLoadOlder,
  onTypingChange,
  ...actions
}: ConversationViewProps) {
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [selected, setSelected] = useState<ChatMessage | null>(null);

  const handleReply = useCallback((messageId: string) => setReplyTarget(messages.find((m) => m.id === messageId) ?? null), [messages]);
  const handleSend = useCallback(
    (body: string) => {
      onSend(body, replyTarget);
      setReplyTarget(null);
    },
    [onSend, replyTarget],
  );
  const lastOwnMessageId = useMemo(() => messages.findLast((m) => m.senderId === currentUserId)?.id ?? null, [messages, currentUserId]);
  const rowConfig = useMemo(
    () => ({ receipt, lastOwnMessageId, showSender: design.showSender, flat: design.flat }),
    [receipt, lastOwnMessageId, design],
  );

  return (
    <ChatUIProvider
      currentUserId={currentUserId}
      theme={design.theme}
      labels={design.labels}
      icons={design.icons}
      components={design.components}
      onReply={handleReply}
      onOpenActions={setSelected}
      {...actions}
    >
      <Background>
        <ChatKeyboardView>
          <MessageRowContext.Provider value={rowConfig}>
            <MessageScrollerProvider messages={messages} defaultScrollPosition="end" autoScroll>
              <MessageScroller ItemComponent={MessageRow} onLoadOlder={onLoadOlder} ListFooterComponent={<TypingIndicator typing={typing} />} />
            </MessageScrollerProvider>
          </MessageRowContext.Provider>
          <ChatKeyboardView.Dock>
            <Composer
              onSend={handleSend}
              onChangeText={onTypingChange}
              topAccessory={replyTarget ? <ReplyBar target={replyTarget} onCancel={() => setReplyTarget(null)} /> : null}
            />
          </ChatKeyboardView.Dock>
        </ChatKeyboardView>
        <MessageActionsSheet message={selected} isPresented={selected !== null} onDismiss={() => setSelected(null)} />
      </Background>
    </ChatUIProvider>
  );
}

function Background({ children }: { children: ReactNode }) {
  const { colors } = useChatTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
}
