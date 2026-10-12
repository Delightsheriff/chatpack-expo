/** Non-React entry point — for calling from RN code outside a component tree. */
import { createChatClient as createCoreChatClient, type ChatClientPlugin } from "@chatpack/client";
import { resolveExpoOptions, type ExpoChatClientOptions } from "./options";

export function createExpoChatClient<
  Plugins extends readonly ChatClientPlugin[] = readonly ChatClientPlugin[],
>(options: ExpoChatClientOptions<Plugins>) {
  return createCoreChatClient(resolveExpoOptions(options));
}

export type { ExpoChatClientOptions } from "./options";
export type { GetAuthHeaders } from "./event-source";
export { attachAppStateRealtimeLifecycle, type RealtimeLifecycle } from "./app-state";
