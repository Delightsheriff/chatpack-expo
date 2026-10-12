import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatClient, MessageSendInput } from "@chatpack/client";
import { useMessages, type ChatClientHookResult } from "@chatpack/client/react";
import type { ClientMessage } from "@chatpack/client";

export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface OptimisticClientMessage extends ClientMessage {
  deliveryStatus?: MessageDeliveryStatus | undefined;
  isOptimistic?: boolean | undefined;
}

export interface UseOptimisticMessagesInput {
  conversationId: string;
  currentUserId: string;
  limit?: number | undefined;
}

export interface SendOptimisticMessageOptions {
  replyToMessageId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface UseOptimisticMessagesResult extends Omit<ChatClientHookResult<unknown>, "data"> {
  /** Combined messages in newest-first order, with optimistic messages at the top. Perfect for FlatList inverted={true}. */
  messages: OptimisticClientMessage[];
  /** Send a message with instant optimistic local rendering (0ms delay). */
  sendMessage: (body: string, options?: SendOptimisticMessageOptions) => Promise<ClientMessage | null>;
  /** Retry sending a failed message. */
  retryMessage: (tempId: string) => Promise<ClientMessage | null>;
  /** Cancel/remove a pending or failed message from the local queue. */
  cancelMessage: (tempId: string) => void;
  /** Load older messages (cursor pagination). */
  loadMore: () => Promise<unknown>;
}

export function useOptimisticMessages(
  client: ChatClient,
  input: UseOptimisticMessagesInput,
): UseOptimisticMessagesResult {
  const { conversationId, currentUserId, limit } = input;
  const listParams = useMemo(
    () => ({
      conversationId,
      ...(limit !== undefined ? { limit } : {}),
    }),
    [conversationId, limit],
  );

  const hookResult = useMessages(client, listParams);

  // Local optimistic messages queue (newest pending messages first)
  const [pendingQueue, setPendingQueue] = useState<OptimisticClientMessage[]>([]);
  const pendingRef = useRef(pendingQueue);
  pendingRef.current = pendingQueue;

  const serverMessages = hookResult.data?.messages ?? [];

  // Combine pending optimistic messages and server messages
  const displayMessages = useMemo(() => {
    const serverIds = new Set(serverMessages.map((m) => m.id));
    const activePending = pendingQueue.filter((p) => !serverIds.has(p.id));

    return [
      ...activePending,
      ...serverMessages.map((m): OptimisticClientMessage => {
        const item: OptimisticClientMessage = {
          ...m,
          deliveryStatus: m.senderId === currentUserId ? "sent" : undefined,
        };
        return item;
      }),
    ];
  }, [pendingQueue, serverMessages, currentUserId]);

  const executeSend = useCallback(
    async (tempId: string, body: string, options?: SendOptimisticMessageOptions): Promise<ClientMessage | null> => {
      try {
        const payload: MessageSendInput = {
          conversationId,
          body,
          ...(options?.replyToMessageId ? { replyToMessageId: options.replyToMessageId } : {}),
          ...(options?.metadata ? { metadata: options.metadata } : {}),
        };

        const result = await client.messages.send(payload);
        if (result.error !== null || !result.data) {
          throw result.error ?? new Error("Failed to send message");
        }

        const serverMessage = result.data;

        // Update local item status to sent and reconcile with server id
        setPendingQueue((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: serverMessage.id,
                  seq: serverMessage.seq,
                  deliveryStatus: "sent",
                  isOptimistic: false,
                }
              : msg,
          ),
        );

        return serverMessage;
      } catch {
        // Mark as failed so user can tap to retry
        setPendingQueue((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  deliveryStatus: "failed",
                }
              : msg,
          ),
        );
        return null;
      }
    },
    [client, conversationId],
  );

  const sendMessage = useCallback(
    async (body: string, options?: SendOptimisticMessageOptions): Promise<ClientMessage | null> => {
      const trimmed = body.trim();
      if (!trimmed) return null;

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Step 1: Construct the optimistic message immediately
      const optimisticMsg: OptimisticClientMessage = {
        id: tempId,
        conversationId,
        senderId: currentUserId,
        body: trimmed,
        role: "user",
        seq: -1,
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
        replyToMessageId: options?.replyToMessageId ?? null,
        replyTo: null,
        reactions: [],
        mentions: [],
        forwardedFrom: null,
        forwardedFromMessageId: null,
        forwardedFromConversationId: null,
        forwardedFromSenderId: null,
        metadata: options?.metadata ?? {},
        deliveryStatus: "sending",
        isOptimistic: true,
      };

      // Step 2: Instant 0ms local prepend
      setPendingQueue((prev) => [optimisticMsg, ...prev]);

      // Step 3: Background network execution
      return executeSend(tempId, trimmed, options);
    },
    [conversationId, currentUserId, executeSend],
  );

  const retryMessage = useCallback(
    async (tempId: string): Promise<ClientMessage | null> => {
      const target = pendingRef.current.find((m) => m.id === tempId);
      if (!target) return null;

      // Reset to sending
      setPendingQueue((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, deliveryStatus: "sending" } : m)),
      );

      const options: SendOptimisticMessageOptions = {
        ...(target.replyToMessageId ? { replyToMessageId: target.replyToMessageId } : {}),
        metadata: target.metadata,
      };

      return executeSend(tempId, target.body, options);
    },
    [executeSend],
  );

  const cancelMessage = useCallback((tempId: string) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== tempId));
  }, []);

  return {
    messages: displayMessages,
    sendMessage,
    retryMessage,
    cancelMessage,
    loadMore: hookResult.loadMore,
    isPending: hookResult.isPending,
    isRefetching: hookResult.isRefetching,
    error: hookResult.error,
    refetch: hookResult.refetch,
  };
}
