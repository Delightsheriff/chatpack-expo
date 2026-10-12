import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { attachAppStateRealtimeLifecycle } from "chatpack-expo/react";
import { createChat, DEMO_USERS, type DemoUser } from "./chat";

type Chat = ReturnType<typeof createChat>;

interface ChatSession {
  userId: DemoUser;
  setUserId: (userId: DemoUser) => void;
  chat: Chat;
}

const ChatSessionContext = createContext<ChatSession | null>(null);

/**
 * One chat client per signed-in (demo) user, shared by every screen. Also
 * disconnects realtime while the app is backgrounded and catches up on
 * return — what a real app does once at its root.
 */
export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<DemoUser>(DEMO_USERS[0]);
  const chat = useMemo(() => createChat(userId), [userId]);

  useEffect(() => attachAppStateRealtimeLifecycle(chat.realtime), [chat]);

  const value = useMemo(() => ({ userId, setUserId, chat }), [userId, chat]);
  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>;
}

export function useChatSession(): ChatSession {
  const session = useContext(ChatSessionContext);
  if (!session) throw new Error("useChatSession must be used inside <ChatSessionProvider>.");
  return session;
}
