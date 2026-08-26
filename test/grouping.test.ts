import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../src/types";
import { isSameGroup, isDifferentCalendarDay, formatDateMarker, formatTimestamp, formatConversationTimestamp } from "../src/utils/grouping";

function message(overrides: Partial<ChatMessage> & { senderId: string; createdAt: string }): ChatMessage {
  return {
    id: "m1",
    conversationId: "c1",
    body: "hi",
    role: "user",
    seq: 1,
    editedAt: null,
    deletedAt: null,
    replyToMessageId: null,
    replyTo: null,
    forwardedFromMessageId: null,
    forwardedFromConversationId: null,
    forwardedFromSenderId: null,
    forwardedFrom: null,
    mentions: [],
    reactions: [],
    metadata: {},
    ...overrides,
  } as ClientMessage;
}

describe("isSameGroup", () => {
  it("groups same-sender messages within the window", () => {
    const a = message({ senderId: "alice", createdAt: "2026-08-26T10:00:00.000Z" });
    const b = message({ senderId: "alice", createdAt: "2026-08-26T10:02:00.000Z" });
    expect(isSameGroup(a, b)).toBe(true);
  });

  it("does not group messages from different senders", () => {
    const a = message({ senderId: "alice", createdAt: "2026-08-26T10:00:00.000Z" });
    const b = message({ senderId: "bob", createdAt: "2026-08-26T10:00:30.000Z" });
    expect(isSameGroup(a, b)).toBe(false);
  });

  it("does not group same-sender messages outside the window", () => {
    const a = message({ senderId: "alice", createdAt: "2026-08-26T10:00:00.000Z" });
    const b = message({ senderId: "alice", createdAt: "2026-08-26T10:10:00.000Z" });
    expect(isSameGroup(a, b)).toBe(false);
  });

  it("returns false when either side is missing (list edges)", () => {
    const a = message({ senderId: "alice", createdAt: "2026-08-26T10:00:00.000Z" });
    expect(isSameGroup(undefined, a)).toBe(false);
    expect(isSameGroup(a, undefined)).toBe(false);
  });
});

describe("isDifferentCalendarDay", () => {
  it("detects a day boundary", () => {
    // Noon UTC on consecutive days — unambiguously different local calendar
    // days in any timezone from UTC-12 to UTC+14, unlike a fixture that
    // straddles UTC midnight (which can land on the same local day
    // depending on the machine's timezone).
    const a = message({ senderId: "alice", createdAt: "2026-08-25T12:00:00.000Z" });
    const b = message({ senderId: "alice", createdAt: "2026-08-26T12:00:00.000Z" });
    expect(isDifferentCalendarDay(a, b)).toBe(true);
  });

  it("returns false within the same day", () => {
    const a = message({ senderId: "alice", createdAt: "2026-08-26T09:00:00.000Z" });
    const b = message({ senderId: "alice", createdAt: "2026-08-26T21:00:00.000Z" });
    expect(isDifferentCalendarDay(a, b)).toBe(false);
  });
});

describe("formatDateMarker", () => {
  it("renders Today / Yesterday relative to now", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    expect(formatDateMarker(new Date("2026-08-26T12:00:00.000Z"), now)).toBe("Today");
    expect(formatDateMarker(new Date("2026-08-25T12:00:00.000Z"), now)).toBe("Yesterday");
  });

  it("falls back to a full date further back", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const result = formatDateMarker(new Date("2026-08-01T12:00:00.000Z"), now);
    expect(result).toContain("August");
  });

  it("includes the year when the date falls in a different year than now", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const result = formatDateMarker(new Date("2025-08-01T12:00:00.000Z"), now);
    expect(result).toContain("2025");
  });
});

describe("formatConversationTimestamp", () => {
  it("renders clock time for today, matching formatTimestamp", () => {
    const now = new Date("2026-08-26T14:30:00.000Z");
    expect(formatConversationTimestamp(now, now)).toBe(formatTimestamp(now));
  });

  it("renders 'Yesterday' for the prior day, not a clock time", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    expect(formatConversationTimestamp(new Date("2026-08-25T12:00:00.000Z"), now)).toBe("Yesterday");
  });

  it("renders a short month/day for anything older, within the same year", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const result = formatConversationTimestamp(new Date("2026-05-23T12:00:00.000Z"), now);
    expect(result).toBe("May 23");
  });

  it("includes the year when older and from a different year", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const result = formatConversationTimestamp(new Date("2024-05-23T12:00:00.000Z"), now);
    expect(result).toContain("2024");
  });
});

describe("formatTimestamp", () => {
  it("produces a non-empty locale time string", () => {
    expect(formatTimestamp(new Date("2026-08-26T14:30:00.000Z")).length).toBeGreaterThan(0);
  });
});
