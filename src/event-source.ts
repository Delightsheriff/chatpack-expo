/**
 * Adapts `XhrEventSource` to chatpack's `EventSourceFactory` contract.
 *
 * The contract is synchronous — `createRealtime` calls
 * `options.eventSource(url, init)` and expects a live object back, no
 * `await`. Auth headers on RN typically come from `expo-secure-store`,
 * which is async. Those two facts don't fit together directly, so this
 * class exists to bridge them: it returns immediately in a `CONNECTING`
 * state, buffers any `addEventListener` calls chatpack makes before the
 * headers resolve, then constructs the real `XhrEventSource` once they do
 * and replays what was buffered onto it.
 *
 * `getAuthHeaders` is re-invoked on every reconnect (a fresh factory call
 * happens each time chatpack's controller sees `readyState === CLOSED`),
 * so a rotated token is picked up automatically without any extra wiring.
 */
import { XhrEventSource, type XhrSseEvent } from "./xhr-event-source";

/** Structural shape chatpack's `ChatpackEventSource` requires. Duplicated here (not imported)
 * to avoid a compile-time dependency on DOM lib types beyond what's needed. */
export interface ChatpackEventSourceLike {
  readonly readyState: number;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
  close(): void;
  onopen: EventListener | null;
  onerror: EventListener | null;
}

export type GetAuthHeaders = () => Record<string, string> | Promise<Record<string, string>>;

export interface ExpoEventSourceInit {
  withCredentials?: boolean;
}

const READY_STATE_CONNECTING = 0;
const READY_STATE_CLOSED = 2;

/** Casts an `XhrSseEvent` across the DOM `Event` boundary — same duck-typing chatpack's
 * own `parseEvent` does on the receiving end (`"data" in event`); nothing here ever
 * constructs a real `Event` instance because RN has none. */
function asEvent(event: XhrSseEvent): Event {
  return event as unknown as Event;
}

class DeferredExpoEventSource implements ChatpackEventSourceLike {
  private real: XhrEventSource | null = null;
  private closed = false;
  private readonly bufferedListeners = new Map<string, Set<(event: Event) => void>>();

  onopen: EventListener | null = null;
  onerror: EventListener | null = null;

  constructor(
    private readonly url: string,
    private readonly init: ExpoEventSourceInit,
    getAuthHeaders: GetAuthHeaders | undefined,
    debug: boolean,
  ) {
    void Promise.resolve(getAuthHeaders?.())
      .then((headers) => this.open(headers, debug))
      .catch((cause: unknown) => {
        // A failed token fetch is a connection failure, not a crash — report
        // it the same way a network error would, so chatpack's `auto` mode
        // falls back to polling instead of the app going down.
        this.onerror?.({ type: "error", message: String(cause) } as unknown as Event);
      });
  }

  private open(headers: Record<string, string> | undefined, debug: boolean): void {
    if (this.closed) return;
    const source = new XhrEventSource(this.url, {
      headers,
      withCredentials: this.init.withCredentials,
      debug,
    });
    source.onopen = () => this.onopen?.({ type: "open" } as unknown as Event);
    source.onerror = (message) =>
      this.onerror?.({ type: "error", message } as unknown as Event);
    for (const [type, listeners] of this.bufferedListeners) {
      for (const listener of listeners) {
        source.addEventListener(type, (event) => listener(asEvent(event)));
      }
    }
    this.real = source;
  }

  get readyState(): number {
    if (this.closed) return READY_STATE_CLOSED;
    return this.real?.readyState ?? READY_STATE_CONNECTING;
  }

  addEventListener(type: string, listener: (event: Event) => void): void {
    if (this.real) {
      this.real.addEventListener(type, (event) => listener(asEvent(event)));
      return;
    }
    let set = this.bufferedListeners.get(type);
    if (!set) {
      set = new Set();
      this.bufferedListeners.set(type, set);
    }
    set.add(listener);
  }

  // Buffered-vs-real listener identity can't round-trip through the wrapping
  // closures above, so `removeEventListener` is a documented no-op once the
  // real source exists. Chatpack never calls it — `disconnect()` always goes
  // through `close()` instead — so this doesn't cause a leak in practice; it
  // would only matter for a caller managing this factory's output directly.
  removeEventListener(type: string, listener: (event: Event) => void): void {
    this.bufferedListeners.get(type)?.delete(listener);
  }

  close(): void {
    this.closed = true;
    this.real?.close();
  }
}

/**
 * Builds the `eventSource` factory to pass into `@chatpack/client`'s
 * `ChatClientOptions`. `getAuthHeaders` is optional — omit it if your
 * backend authenticates some other way (e.g. a signed query param baked
 * into `baseURL`); most setups will want it, since RN has no cookie jar
 * for `credentials: "include"` to lean on.
 */
export function createExpoEventSourceFactory(
  getAuthHeaders?: GetAuthHeaders,
  options: { debug?: boolean } = {},
) {
  return (url: string, init: ExpoEventSourceInit): ChatpackEventSourceLike =>
    new DeferredExpoEventSource(url, init, getAuthHeaders, options.debug ?? false);
}
