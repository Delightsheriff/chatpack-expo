import type { ClientMessage } from "@chatpack/client";

/** Messages from the same sender within this window render as one visual group. */
export const DEFAULT_GROUPING_WINDOW_MS = 5 * 60 * 1000;

export function isSameGroup(
  a: ClientMessage | undefined,
  b: ClientMessage | undefined,
  windowMs: number = DEFAULT_GROUPING_WINDOW_MS,
): boolean {
  if (!a || !b) return false;
  if (a.senderId !== b.senderId) return false;
  return Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) <= windowMs;
}

/** Whether a date-separator `Marker` belongs between `a` and `b` (chronological a → b). */
export function isDifferentCalendarDay(a: ClientMessage | undefined, b: ClientMessage | undefined): boolean {
  if (!a || !b) return Boolean(b) && !a;
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);
  return (
    dateA.getFullYear() !== dateB.getFullYear() ||
    dateA.getMonth() !== dateB.getMonth() ||
    dateA.getDate() !== dateB.getDate()
  );
}

export function formatDateMarker(date: Date, now: Date = new Date()): string {
  const isSameDay = (x: Date, y: Date) =>
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
