import Constants from "expo-constants";
import { createExpoChatClient } from "chatpack-expo/react";
import { presenceClient, receiptsClient, typingClient } from "@chatpack/client/plugins";

// The local test server (chatpack-expo-server-test/server.ts) runs on the
// same machine as Metro. Use the host Expo Go loaded the bundle from, so a
// physical phone on Wi-Fi, the Android emulator and the iOS simulator all
// reach it — "localhost" on a real phone is the phone itself.
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
export const BASE_URL = `http://${devHost ?? "localhost"}:3000`;

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
