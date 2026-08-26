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

export function resolveExpoOptions<Plugins extends readonly ChatClientPlugin[]>(
  options: ExpoChatClientOptions<Plugins>,
): ChatClientOptions<Plugins> {
  const { getAuthHeaders, debugRealtime, headers, ...rest } = options;
  const resolvedHeaders = headers ?? (getAuthHeaders ? () => getAuthHeaders() : undefined);
  return {
    ...rest,
    ...(resolvedHeaders === undefined ? {} : { headers: resolvedHeaders }),
    eventSource: createExpoEventSourceFactory(getAuthHeaders, { debug: debugRealtime ?? false }),
  };
}
