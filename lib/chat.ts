import { createExpoChatClient } from "chatpack-expo/react";
import { presenceClient, receiptsClient, typingClient } from "@chatpack/client/plugins";

// Point at the local test server from chatpack-expo-server-test/server.ts.
// From the iOS Simulator, "localhost" resolves to the host Mac.
export const BASE_URL = "http://localhost:3000";

/** The demo users the local server accepts via the trusted x-user-id header. */
export const DEMO_USERS = ["alice", "bob", "carol", "dave"] as const;
export type DemoUser = (typeof DEMO_USERS)[number];

export function createChat(userId: string) {
  return createExpoChatClient({
    baseURL: BASE_URL,
    userId,
    getAuthHeaders: () => ({ "x-user-id": userId }),
    // Must match the server's plugins (typing/presence/receipts) — without
    // them useTyping/useReceipts stay null and the UI never shows dots or ticks.
    plugins: [typingClient(), presenceClient(), receiptsClient()],
    debugRealtime: true,
  });
}
