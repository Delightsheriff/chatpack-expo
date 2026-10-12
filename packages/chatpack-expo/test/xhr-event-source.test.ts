import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { XhrEventSource, type XhrSseEvent } from "../src/xhr-event-source";

/**
 * Fake XHR standing in for RN's, since this class's whole design bet is on
 * `onreadystatechange` firing with `readyState === LOADING` and a growing
 * `responseText` as chunks arrive — that's what's under test here, not
 * anything network-related.
 */
class FakeXHR {
  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;

  readyState = FakeXHR.UNSENT;
  status = 0;
  responseText = "";
  withCredentials = false;
  headers: Record<string, string> = {};
  onreadystatechange: (() => void) | null = null;
  onerror: (() => void) | null = null;
  aborted = false;

  open(_method: string, _url: string): void {
    this.readyState = FakeXHR.OPENED;
  }
  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
  send(): void {}
  abort(): void {
    this.aborted = true;
  }

  /** Test helper: simulate a chunk of the response body arriving. */
  pushChunk(text: string): void {
    this.responseText += text;
    this.status = 200;
    this.readyState = FakeXHR.LOADING;
    this.onreadystatechange?.();
  }

  /** Test helper: simulate the server closing the stream cleanly. */
  finish(): void {
    this.readyState = FakeXHR.DONE;
    this.onreadystatechange?.();
  }
}

describe("XhrEventSource", () => {
  let instances: FakeXHR[];

  beforeEach(() => {
    instances = [];
    vi.stubGlobal(
      "XMLHttpRequest",
      class extends FakeXHR {
        constructor() {
          super();
          instances.push(this);
        }
      },
    );
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("sends custom headers and the Accept/no-cache defaults, but no Last-Event-ID on first connect", () => {
    new XhrEventSource("https://api.test/stream", { headers: { Authorization: "Bearer t1" } });
    const xhr = instances[0]!;
    expect(xhr.headers["Authorization"]).toBe("Bearer t1");
    expect(xhr.headers["Accept"]).toBe("text/event-stream");
    expect(xhr.headers["Last-Event-ID"]).toBeUndefined();
  });

  it("parses a single well-formed SSE record", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message.created", (e) => received.push(e));

    instances[0]!.pushChunk('event: message.created\nid: 1\ndata: {"seq":1}\n\n');

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      type: "message.created",
      data: '{"seq":1}',
      lastEventId: "1",
    });
  });

  it("defaults to type 'message' when no event: field is present", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message", (e) => received.push(e));
    instances[0]!.pushChunk("data: hello\n\n");
    expect(received[0]?.type).toBe("message");
  });

  it("joins multi-line data fields with \\n, per the SSE spec", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message", (e) => received.push(e));
    instances[0]!.pushChunk("data: line one\ndata: line two\n\n");
    expect(received[0]?.data).toBe("line one\nline two");
  });

  it("does not re-dispatch a record still arriving, and picks the tail up once it's complete", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message", (e) => received.push(e));

    // Partial chunk: no terminating blank line yet — must not fire.
    instances[0]!.pushChunk("data: partial");
    expect(received).toHaveLength(0);

    // Completes the first record and starts a second in the same tick.
    instances[0]!.pushChunk("\n\ndata: second\n\n");
    expect(received).toHaveLength(2);
    expect(received[0]?.data).toBe("partial");
    expect(received[1]?.data).toBe("second");
  });

  it("assembles a record split across more than two ticks, dispatching once with no duplicates", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message", (e) => received.push(e));

    // Same record's bytes trickle in across four separate onreadystatechange
    // ticks — exercises consume() reading only the new tail each time
    // (consumedLength) rather than re-scanning the whole responseText, and
    // pendingRecord correctly carrying the incomplete tail across every
    // intermediate tick, not just one.
    instances[0]!.pushChunk("data: pie");
    expect(received).toHaveLength(0);
    instances[0]!.pushChunk("ce");
    expect(received).toHaveLength(0);
    instances[0]!.pushChunk("d toget");
    expect(received).toHaveLength(0);
    instances[0]!.pushChunk("her\n\n");

    expect(received).toHaveLength(1);
    expect(received[0]?.data).toBe("pieced together");
  });

  it("does not re-dispatch already-consumed records when a later tick has no new complete record", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const received: XhrSseEvent[] = [];
    source.addEventListener("message", (e) => received.push(e));

    instances[0]!.pushChunk("data: first\n\n");
    expect(received).toHaveLength(1);

    // A further tick that only starts a new, still-incomplete record must
    // not re-dispatch "first" (the old absolute-boundary implementation
    // couldn't double-dispatch here either, but the new relative/consumedLength
    // tracking is exactly the kind of change that could reintroduce it).
    instances[0]!.pushChunk("data: second");
    expect(received).toHaveLength(1);

    instances[0]!.pushChunk("\n\n");
    expect(received).toHaveLength(2);
    expect(received[1]?.data).toBe("second");
  });

  it("dispatches only to listeners registered for the matching event type", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const created: XhrSseEvent[] = [];
    const deleted: XhrSseEvent[] = [];
    source.addEventListener("message.created", (e) => created.push(e));
    source.addEventListener("message.deleted", (e) => deleted.push(e));
    instances[0]!.pushChunk("event: message.created\ndata: a\n\n");
    expect(created).toHaveLength(1);
    expect(deleted).toHaveLength(0);
  });

  it("fires onopen exactly once even across multiple chunks", () => {
    const source = new XhrEventSource("https://api.test/stream");
    const opens = vi.fn();
    source.onopen = opens;
    instances[0]!.pushChunk("data: a\n\n");
    instances[0]!.pushChunk("data: b\n\n");
    expect(opens).toHaveBeenCalledTimes(1);
  });

  it("resends Last-Event-ID on reconnect after the stream ends", () => {
    const source = new XhrEventSource("https://api.test/stream", { reconnectIntervalMs: 1000 });
    instances[0]!.pushChunk("id: 42\ndata: a\n\n");
    instances[0]!.finish();

    vi.advanceTimersByTime(1000);

    expect(instances).toHaveLength(2);
    expect(instances[1]!.headers["Last-Event-ID"]).toBe("42");
    source.close();
  });

  it("reports readyState CONNECTING (not CLOSED) while retrying after an error", () => {
    const source = new XhrEventSource("https://api.test/stream", { reconnectIntervalMs: 1000 });
    instances[0]!.status = 500;
    instances[0]!.readyState = FakeXHR.DONE;
    instances[0]!.onreadystatechange?.();

    // CONNECTING, matching the standard EventSource readyState value — the
    // outer chatpack controller only reconnects on CLOSED (2), so reporting
    // CLOSED here would cause it to spin up a redundant second stream on
    // top of this one's own retry.
    expect(source.readyState).toBe(0);
    source.close();
    expect(source.readyState).toBe(2);
  });

  it("close() aborts the in-flight request and cancels any pending reconnect", () => {
    const source = new XhrEventSource("https://api.test/stream", { reconnectIntervalMs: 1000 });
    instances[0]!.finish();
    source.close();
    vi.advanceTimersByTime(5000);
    expect(instances).toHaveLength(1); // no reconnect happened after close()
    expect(instances[0]!.aborted).toBe(true);
  });
});
