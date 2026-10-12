import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createExpoEventSourceFactory } from "../src/event-source";

/** Minimal fake XHR — same shape as xhr-event-source.test.ts's, just enough for XhrEventSource to construct and register handlers against. */
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

  open(): void {
    this.readyState = FakeXHR.OPENED;
  }
  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
  send(): void {}
  abort(): void {}

  pushChunk(text: string): void {
    this.responseText += text;
    this.status = 200;
    this.readyState = FakeXHR.LOADING;
    this.onreadystatechange?.();
  }
}

/** A promise the test controls the resolution timing of, standing in for an async `getAuthHeaders` (e.g. a SecureStore read). */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("createExpoEventSourceFactory / DeferredExpoEventSource", () => {
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes a listener registered before headers resolve, so it's never wired onto the real source", async () => {
    const auth = deferred<Record<string, string>>();
    const factory = createExpoEventSourceFactory(() => auth.promise);
    const source = factory("https://api.test/stream", {});

    const received: unknown[] = [];
    const listener = (e: Event) => received.push(e);
    source.addEventListener("message", listener);
    source.removeEventListener("message", listener);

    auth.resolve({});
    await Promise.resolve();
    await Promise.resolve();

    instances[0]!.pushChunk("data: hello\n\n");
    expect(received).toHaveLength(0);
  });

  it("removes a listener registered after the real source exists", async () => {
    const factory = createExpoEventSourceFactory(() => ({}));
    const source = factory("https://api.test/stream", {});

    // No auth delay this time, but open() still runs via a microtask
    // (Promise.resolve(getAuthHeaders()).then(...)) — flush it first.
    await Promise.resolve();
    await Promise.resolve();

    const received: unknown[] = [];
    const listener = (e: Event) => received.push(e);
    source.addEventListener("message", listener);
    source.removeEventListener("message", listener);

    instances[0]!.pushChunk("data: hello\n\n");
    expect(received).toHaveLength(0);
  });

  it("removing one listener doesn't affect another still registered for the same type", async () => {
    const factory = createExpoEventSourceFactory(() => ({}));
    const source = factory("https://api.test/stream", {});
    await Promise.resolve();
    await Promise.resolve();

    const keptReceived: unknown[] = [];
    const removedReceived: unknown[] = [];
    const kept = (e: Event) => keptReceived.push(e);
    const removed = (e: Event) => removedReceived.push(e);

    source.addEventListener("message", kept);
    source.addEventListener("message", removed);
    source.removeEventListener("message", removed);

    instances[0]!.pushChunk("data: hello\n\n");
    expect(keptReceived).toHaveLength(1);
    expect(removedReceived).toHaveLength(0);
  });

  it("a listener buffered before open still fires normally if never removed", async () => {
    const auth = deferred<Record<string, string>>();
    const factory = createExpoEventSourceFactory(() => auth.promise);
    const source = factory("https://api.test/stream", {});

    const received: unknown[] = [];
    source.addEventListener("message", (e) => received.push(e));

    auth.resolve({});
    await Promise.resolve();
    await Promise.resolve();

    instances[0]!.pushChunk("data: hello\n\n");
    expect(received).toHaveLength(1);
  });
});
