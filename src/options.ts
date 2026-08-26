/**
 * Shared option resolution for both entry points (`./index` and `./react`).
 * Kept separate so the two `createExpoChatClient` variants don't duplicate
 * the auth/transport wiring — they differ only in which upstream
 * `createChatClient` they hand the resolved options to.
 */
import type { ChatClientOptions, ChatClientPlugin } from "@chatpack/client";
import { createExpoEventSourceFactory, type GetAuthHeaders } from "./event-source";

export interface ExpoChatClientOptions<
  Plugins extends readonly ChatClientPlugin[] = readonly ChatClientPlugin[],
> extends Omit<ChatClientOptions<Plugins>, "eventSource" | "baseURL"> {
  /**
   * Required here (optional upstream): the browser client falls back to
   * `window.location.origin` for a relative URL, which doesn't exist in
   * React Native. Always pass an absolute URL, e.g.
   * `https://api.yourapp.com`.
   */
  baseURL: string;
  /**
   * Resolves the bearer token (or whatever headers your `auth` hook expects)
   * for both REST requests and the SSE stream. Called fresh on every
   * request and on every reconnect, so a rotated token is picked up
   * automatically. Overridable per-call via the standard `headers` option
   * for REST only — `getAuthHeaders` is the only way to authenticate the
   * stream, since chatpack's `EventSourceFactory` contract has no headers
   * channel of its own.
   */
  getAuthHeaders?: GetAuthHeaders;
  /** Forwarded to the vendored SSE client's `console.debug` logging. */
  debugRealtime?: boolean;
}

/**
 * `@chatpack/client`'s request layer unconditionally reads
 * `window.location.origin` as the base argument to `new URL(url, base)` —
 * guarded only by `typeof window === "undefined"`, not by whether
 * `window.location` itself exists (`packages/client/src/request.ts`). RN
 * (Hermes, and Expo's own polyfills) defines a global `window` — usually as
 * an alias for `globalThis` — but that object has no `location`, so the
 * client throws `TypeError: Cannot read property 'origin' of undefined` on
 * *every* REST call, even though `baseURL` is always absolute here and the
 * base argument would otherwise be discarded by `URL`'s own parser.
 *
 * Requiring an absolute `baseURL` (see `ExpoChatClientOptions.baseURL`)
 * doesn't avoid this — the crash happens while *constructing* the argument,
 * before `URL` ever gets to ignore it. This fills in a minimal
 * `window.location.origin` derived from `baseURL` so that read succeeds.
 * Never overwrites an existing `location` (e.g. a test environment or a
 * future RN runtime that legitimately provides one), and does nothing if
 * `window` itself doesn't exist — `@chatpack/client`'s own fallback branch
 * already handles that case correctly.
 */
function ensureWindowLocationOrigin(baseURL: string): void {
  const target = globalThis as { window?: { location?: unknown } };
  if (typeof target.window === "undefined" || target.window === null) return;
  if (target.window.location !== undefined) return;
  try {
    const origin = new URL(baseURL).origin;
    (target.window as { location?: unknown }).location = { origin };
  } catch {
    // Malformed baseURL — leave it for @chatpack/client's own validation
    // (or the eventual fetch failure) to report.
  }
}

export function resolveExpoOptions<Plugins extends readonly ChatClientPlugin[]>(
  options: ExpoChatClientOptions<Plugins>,
): ChatClientOptions<Plugins> {
  const { getAuthHeaders, debugRealtime, headers, ...rest } = options;
  ensureWindowLocationOrigin(options.baseURL);
  const resolvedHeaders = headers ?? (getAuthHeaders ? () => getAuthHeaders() : undefined);
  return {
    ...rest,
    ...(resolvedHeaders === undefined ? {} : { headers: resolvedHeaders }),
    eventSource: createExpoEventSourceFactory(getAuthHeaders, { debug: debugRealtime ?? false }),
  };
}
