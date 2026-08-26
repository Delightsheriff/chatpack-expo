import { isSameDay, subDays, differenceInMilliseconds, format } from "date-fns";
import type { ChatMessage } from "../types";

/** Messages from the same sender within this window render as one visual group. */
export const DEFAULT_GROUPING_WINDOW_MS = 5 * 60 * 1000;

export function isSameGroup(
  a: ChatMessage | undefined,
  b: ChatMessage | undefined,
  windowMs: number = DEFAULT_GROUPING_WINDOW_MS,
): boolean {
  if (!a || !b) return false;
  if (a.senderId !== b.senderId) return false;
  return Math.abs(differenceInMilliseconds(new Date(b.createdAt), new Date(a.createdAt))) <= windowMs;
}

/** Whether a date-separator `Marker` belongs between `a` and `b` (chronological a → b). */
export function isDifferentCalendarDay(a: ChatMessage | undefined, b: ChatMessage | undefined): boolean {
  if (!a || !b) return Boolean(b) && !a;
  return !isSameDay(new Date(a.createdAt), new Date(b.createdAt));
}

/**
 * `now` is a parameter, not read internally via `new Date()` — deliberately,
 * so this stays deterministic and testable with a fixed reference time.
 * date-fns' own `isToday`/`isYesterday` always compare against the real
 * system clock and can't be pointed at an arbitrary `now`, so this composes
 * `isSameDay` + `subDays` instead to get the same "relative to `now`"
 * behavior with date-fns' day-boundary math (DST-safe) rather than hand-rolled.
 */
export function formatDateMarker(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return format(date, sameYear ? "EEEE, MMMM d" : "EEEE, MMMM d, yyyy");
}

export function formatTimestamp(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * The compact, adaptive timestamp a chat-list row wants — clock time for
 * today, `"Yesterday"`, then a short date — as opposed to `formatTimestamp`
 * (always clock time, for a message bubble where the day is already
 * established by the surrounding `Marker`) or `formatDateMarker` (a full
 * separator label, not a one-line row timestamp).
 */
export function formatConversationTimestamp(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return formatTimestamp(date);
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return format(date, sameYear ? "MMM d" : "MMM d, yyyy");
}
