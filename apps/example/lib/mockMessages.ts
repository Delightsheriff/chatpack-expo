import type { ChatMessage } from "chatpack-expo-ui";

// --- Pure mock data. No backend, no chatpack-expo, nothing real behind this. ---

export const ME = "me";
export const OTHER = "alex";

export function msg(overrides: Partial<ChatMessage> & { id: string; senderId: string; body: string; createdAt: string }): ChatMessage {
  return {
    conversationId: "preview",
    role: "user",
    seq: Number(overrides.id),
    editedAt: null,
    deletedAt: null,
    replyToMessageId: null,
    replyTo: null,
    forwardedFromMessageId: null,
    forwardedFromConversationId: null,
    forwardedFromSenderId: null,
    forwardedFrom: null,
    reactions: [],
    mentions: [],
    metadata: {},
    ...overrides,
  };
}

// Spans 5 calendar days on purpose — enough for several date-separator
// Markers to appear, and enough total rows (30) to actually need scrolling
// on a real device screen instead of fitting in one glance.
export const SEED_MESSAGES: ChatMessage[] = [
  msg({ id: "1", senderId: OTHER, body: "Hey! Welcome to the project 👋", createdAt: "2026-08-23T09:00:00.000Z" }),
  msg({ id: "2", senderId: OTHER, body: "Let me know if you need access to anything.", createdAt: "2026-08-23T09:00:30.000Z" }),
  msg({ id: "3", senderId: ME, body: "Thanks! Will do.", createdAt: "2026-08-23T09:10:00.000Z" }),
  msg({ id: "4", senderId: OTHER, body: "Kickoff call is at 2pm if you're free.", createdAt: "2026-08-23T14:55:00.000Z" }),
  msg({ id: "5", senderId: ME, body: "I'll be there.", createdAt: "2026-08-23T14:56:00.000Z" }),

  msg({ id: "6", senderId: OTHER, body: "Morning! Did the deploy go out overnight?", createdAt: "2026-08-24T08:30:00.000Z" }),
  msg({ id: "7", senderId: ME, body: "Yep, all green.", createdAt: "2026-08-24T08:32:00.000Z" }),
  msg({ id: "8", senderId: ME, body: "No incidents reported either.", createdAt: "2026-08-24T08:32:20.000Z" }),
  msg({ id: "9", senderId: OTHER, body: "Nice. I'll check the dashboards anyway just in case.", createdAt: "2026-08-24T08:40:00.000Z" }),
  msg({
    id: "10",
    senderId: OTHER,
    body: "All clear on my end too.",
    createdAt: "2026-08-24T09:15:00.000Z",
    reactions: [{ emoji: "👍", count: 1, userIds: [ME] }],
  }),

  msg({ id: "11", senderId: ME, body: "Hey! Did you get a chance to look at the new designs?", createdAt: "2026-08-26T09:00:00.000Z" }),
  msg({ id: "12", senderId: ME, body: "I pushed a few variants to the shared folder this morning.", createdAt: "2026-08-26T09:00:40.000Z" }),
  msg({
    id: "13",
    senderId: OTHER,
    body: "Just opened them now — the second one is really clean.",
    createdAt: "2026-08-26T09:05:00.000Z",
    reactions: [{ emoji: "🔥", count: 1, userIds: [ME] }],
  }),
  msg({ id: "14", senderId: OTHER, body: "Can we go with that for the demo?", createdAt: "2026-08-26T09:05:20.000Z" }),
  msg({
    id: "15",
    senderId: ME,
    body: "Agreed, let's lock it in.",
    createdAt: "2026-08-26T09:08:00.000Z",
    replyToMessageId: "13",
    replyTo: { id: "13", senderId: OTHER, excerpt: "Just opened them now — the second one is really clean.", deleted: false },
  }),
  msg({ id: "16", senderId: OTHER, body: "🎉", createdAt: "2026-08-26T09:08:30.000Z" }),
  msg({
    id: "17",
    senderId: ME,
    body: "One more thing — mind reviewing the copy on the empty state?",
    createdAt: "2026-08-26T16:15:00.000Z",
  }),
  msg({ id: "18", senderId: ME, body: "It's the second screen in the same folder.", createdAt: "2026-08-26T16:15:30.000Z" }),
  msg({ id: "19", senderId: OTHER, body: "On it.", createdAt: "2026-08-26T16:40:00.000Z" }),

  msg({ id: "20", senderId: OTHER, body: "Rewrote the empty state copy, take a look when you can.", createdAt: "2026-08-27T08:00:00.000Z" }),
  msg({ id: "21", senderId: ME, body: "Reading now.", createdAt: "2026-08-27T08:05:00.000Z" }),
  msg({ id: "22", senderId: ME, body: "This is much better than what we had.", createdAt: "2026-08-27T08:05:40.000Z" }),
  msg({ id: "23", senderId: ME, body: "Shipping it.", createdAt: "2026-08-27T08:06:00.000Z" }),
  msg({
    id: "24",
    senderId: OTHER,
    body: "🙌",
    createdAt: "2026-08-27T08:06:30.000Z",
    reactions: [
      { emoji: "🎉", count: 1, userIds: [ME] },
      { emoji: "🔥", count: 1, userIds: [ME] },
    ],
  }),
  msg({ id: "25", senderId: OTHER, body: "What's next on the list?", createdAt: "2026-08-27T08:20:00.000Z" }),
  msg({ id: "26", senderId: ME, body: "The onboarding flow — I'll write up a plan today.", createdAt: "2026-08-27T08:21:00.000Z" }),
  msg({ id: "27", senderId: OTHER, body: "Sounds good, no rush.", createdAt: "2026-08-27T08:22:00.000Z" }),
  msg({ id: "28", senderId: OTHER, body: "Let's sync properly on it tomorrow.", createdAt: "2026-08-27T08:22:20.000Z" }),
  msg({ id: "29", senderId: ME, body: "Works for me.", createdAt: "2026-08-27T08:25:00.000Z" }),
  msg({ id: "30", senderId: ME, body: "Talk then 👋", createdAt: "2026-08-27T08:25:20.000Z" }),
];
