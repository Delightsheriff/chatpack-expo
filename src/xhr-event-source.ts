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
 * `responseText` itself is always the *whole* accumulated response (RN's
 * XHR gives no finer-grained read), but `consume()` only slices and scans
 * the new tail since the last tick — via `consumedLength` and a carried
 * `pendingRecord` for a record split across two ticks — rather than
 * re-scanning everything received so far each time, so per-tick cost
 * doesn't grow with total stream length.
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
  /** How much of `responseText` we've already read — lets `consume()` slice only the new tail each tick instead of re-scanning everything received so far. */
  private consumedLength = 0;
  /** A trailing, not-yet-`\n\n`-terminated record carried across ticks (a record can arrive split across two `onreadystatechange` calls). */
  private pendingRecord = "";
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
    this.consumedLength = 0;
    this.pendingRecord = "";

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

  /**
   * Slices only the bytes that arrived since the last tick — `responseText`
   * itself is the full accumulated response (that part's unavoidable, RN's
   * XHR gives us nothing finer-grained), but earlier versions of this
   * method additionally re-scanned that whole string with `lastIndexOf`
   * every tick, making total work across a stream O(n²) in message count.
   * This tracks how much has already been consumed and only looks at the
   * new tail, carrying any incomplete trailing record forward as
   * `pendingRecord` instead of re-finding the same boundary twice.
   */
  private consume(responseText: string): void {
    const newText = responseText.slice(this.consumedLength);
    this.consumedLength = responseText.length;
    if (newText.length === 0) return;

    const records = (this.pendingRecord + newText).split("\n\n");
    // The last split segment is either "" (the new text ended exactly on a
    // \n\n boundary) or an incomplete record — either way, it isn't a
    // complete record yet, so it's carried forward rather than dispatched.
    this.pendingRecord = records.pop() ?? "";

    for (const record of records) {
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
