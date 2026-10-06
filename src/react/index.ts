/**
 * React entry point. Re-exports every hook from `@chatpack/client/react`
 * unchanged — the transport swap happens entirely inside
 * `createExpoChatClient`, so `useConversations`, `useMessages`, etc. work
 * identically to their web usage against whatever client instance they're
 * given.
 */
import { createChatClient as createReactChatClient } from "@chatpack/client/react";
import type { ChatClientPlugin } from "@chatpack/client";
import { resolveExpoOptions, type ExpoChatClientOptions } from "../options";

export function createExpoChatClient<
  Plugins extends readonly ChatClientPlugin[] = readonly ChatClientPlugin[],
>(options: ExpoChatClientOptions<Plugins>) {
  return createReactChatClient(resolveExpoOptions(options));
}

export {
  useConversation,
  useConversations,
  useMessages,
  useMessageSearch,
  usePresence,
  useReceipts,
  useRealtimeStatus,
  useTyping,
} from "@chatpack/client/react";
export type {
  ChatClientHookResult,
  MessageSearchHookResult,
  MessagesHookResult,
  ReactChatClient,
} from "@chatpack/client/react";

export { useOptimisticMessages } from "./useOptimisticMessages";
export type {
  MessageDeliveryStatus,
  OptimisticClientMessage,
  UseOptimisticMessagesInput,
  SendOptimisticMessageOptions,
  UseOptimisticMessagesResult,
} from "./useOptimisticMessages";

export type { ExpoChatClientOptions } from "../options";
export type { GetAuthHeaders } from "../event-source";
export { attachAppStateRealtimeLifecycle, type RealtimeLifecycle } from "../app-state";
