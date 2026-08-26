/**
 * SSE client for React Native, built on XMLHttpRequest.
 *
 * React Native has no `EventSource` and (until `expo/fetch`, SDK 50+) no
 * streaming `fetch` body either — `fetch()` resolves only once the response
 * is fully buffered. RN's `XMLHttpRequest`, however, fires `onreadystatechange`
 * with `readyState === LOADING` as chunks arrive and exposes the
 * accumulated body so far via `responseText`. That's the only place to get
 * incremental delivery without a native module, so this re-parses
 * `responseText` from scratch on every readystatechange tick and processes
 * only the newly-arrived tail (tracked via `processedLength`).
 *
 * This is adapted from react-native-sse (MIT, binaryminds), vendored rather
 * than depended-on: the package is small, unmaintained since March 2024, and
 * the two things Chatpack's realtime layer actually needs from it — custom
 * request headers, and automatic `Last-Event-ID` resend on reconnect — are
 * simple enough to own directly and keep in sync with chatpack's contract.
 *
 * Known cost of the responseText-reparse approach: it's O(n) per tick against
 * the *whole* buffered response, not just the new bytes, so it re-scans
 * everything received so far on every chunk. For a chat stream — small JSON
 * messages, not a multi-megabyte feed — this is a non-issue in practice, but
 * it's why this class is not a fit for high-volume SSE (e.g. streaming LLM
 * tokens over a long single response). Chatpack fits the assumption: RN
 * apps that outgrow it can swap the underlying transport (see
 * `createExpoEventSourceFactory`'s `transport` option) for one built on
 * `expo/fetch`'s real `ReadableStream` without touching anything upstream.
 */

const READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
} as const;

/** Minimal event shape this class dispatches — matches what chatpack's `parseEvent` reads (`"data" in event`). */
export interface XhrSseEvent {
  type: string;
  data: string | null;
  lastEventId: string | null;
  url: string;
}

export interface XhrEventSourceOptions {
  headers?: Record<string, string> | undefined;
  withCredentials?: boolean | undefined;
  /** Delay before the first connection attempt. Default 0 — dial immediately. */
  timeoutBeforeConnectionMs?: number | undefined;
  /** Delay before reconnecting after the stream ends or errors. Default 1000. */
  reconnectIntervalMs?: number | undefined;
  debug?: boolean | undefined;
}

type XhrListener = (event: XhrSseEvent) => void;

/**
 * XHR-backed EventSource-alike. Not a `ChatpackEventSource` itself — see
 * `event-source.ts` for the adapter that also handles async header
 * resolution (SecureStore reads can't happen inside a synchronous
 * `EventSourceFactory` call).
 */
export class XhrEventSource {
  private xhr: XMLHttpRequest | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private processedLength = 0;
  private lastEventId: string | null = null;
  private closed = false;
  private status: (typeof READY_STATE)[keyof typeof READY_STATE] = READY_STATE.CONNECTING;
  private readonly listeners = new Map<string, Set<XhrListener>>();
  private readonly reconnectIntervalMs: number;
  private readonly debug: boolean;

  onopen: (() => void) | null = null;
  onerror: ((message: string) => void) | null = null;

  constructor(
    private readonly url: string,
    private readonly options: XhrEventSourceOptions = {},
  ) {
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 1000;
    this.debug = options.debug ?? false;
    const delay = options.timeoutBeforeConnectionMs ?? 0;
    if (delay > 0) {
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    } else {
      this.connect();
    }
  }

  get readyState(): number {
    if (this.closed) return READY_STATE.CLOSED;
    // A stream mid-error is retrying, same as a real EventSource — report
    // CONNECTING (not CLOSED) so chatpack's realtime controller doesn't tear
    // this instance down and construct a redundant replacement (it only
    // reconnects when `readyState === CLOSED`).
    return this.status === READY_STATE.OPEN ? READY_STATE.OPEN : READY_STATE.CONNECTING;
  }

  addEventListener(type: string, listener: XhrListener): void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);
  }

  removeEventListener(type: string, listener: XhrListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.xhr?.abort();
    this.xhr = null;
  }

  private log(...args: unknown[]): void {
    if (this.debug) console.debug("[chatpack-expo][sse]", ...args);
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectIntervalMs);
  }

  private connect(): void {
    if (this.closed) return;
    this.status = READY_STATE.CONNECTING;
    this.processedLength = 0;

    const xhr = new XMLHttpRequest();
    this.xhr = xhr;
    xhr.open("GET", this.url, true);
    xhr.setRequestHeader("Accept", "text/event-stream");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    for (const [key, value] of Object.entries(this.options.headers ?? {})) {
      xhr.setRequestHeader(key, value);
    }
    // The whole point of vendoring this: resend the last id we saw so
    // chatpack's stream can backfill whatever was missed while disconnected
    // (durable events carry `seq`; this is how the client recovers gaps).
    if (this.lastEventId !== null) xhr.setRequestHeader("Last-Event-ID", this.lastEventId);
    if (this.options.withCredentials) xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
      if (this.closed || xhr !== this.xhr) return;
      if (xhr.readyState !== XMLHttpRequest.LOADING && xhr.readyState !== XMLHttpRequest.DONE) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        if (this.status !== READY_STATE.OPEN) {
          this.status = READY_STATE.OPEN;
          this.log("open");
          this.onopen?.();
        }
        this.consume(xhr.responseText ?? "");
        if (xhr.readyState === XMLHttpRequest.DONE) {
          // The server closed a healthy stream (idle timeout on a proxy,
          // planned redeploy) — reconnect exactly like a browser EventSource
          // would, carrying `lastEventId` forward.
          this.log("stream ended, reconnecting");
          this.scheduleReconnect();
        }
      } else if (xhr.status !== 0) {
        this.status = READY_STATE.CONNECTING;
        this.log("http error", xhr.status);
        this.onerror?.(`HTTP ${xhr.status}`);
        if (xhr.readyState === XMLHttpRequest.DONE) this.scheduleReconnect();
      }
    };

    xhr.onerror = () => {
      if (this.closed || xhr !== this.xhr) return;
      this.status = READY_STATE.CONNECTING;
      this.log("network error");
      this.onerror?.("network error");
      this.scheduleReconnect();
    };

    xhr.send();
  }

  /** Re-scans `responseText` from `processedLength` for complete `\n\n`-terminated SSE records. */
  private consume(responseText: string): void {
    const boundary = responseText.lastIndexOf("\n\n");
    if (boundary === -1 || boundary < this.processedLength) return;

    const chunk = responseText.slice(this.processedLength, boundary);
    this.processedLength = boundary + 2;

    for (const record of chunk.split("\n\n")) {
      this.dispatchRecord(record);
    }
  }

  private dispatchRecord(record: string): void {
    let type: string | undefined;
    let id: string | null | undefined;
    const dataLines: string[] = [];

    for (const rawLine of record.split(/\r\n|\r|\n/)) {
      const line = rawLine.trim();
      if (line.startsWith("event")) {
        type = line.replace(/^event:?\s*/, "");
      } else if (line.startsWith("data")) {
        dataLines.push(line.replace(/^data:?\s*/, ""));
      } else if (line.startsWith("id")) {
        const value = line.replace(/^id:?\s*/, "");
        id = value === "" ? null : value;
      }
      // `retry:` is intentionally ignored — chatpack does not send it, and
      // this class's reconnect delay is a fixed local policy instead.
    }

    if (dataLines.length === 0) return;
    if (id !== undefined) this.lastEventId = id;

    const eventType = type ?? "message";
    const event: XhrSseEvent = {
      type: eventType,
      data: dataLines.join("\n"),
      lastEventId: this.lastEventId,
      url: this.url,
    };
    for (const listener of this.listeners.get(eventType) ?? []) listener(event);
  }
}
