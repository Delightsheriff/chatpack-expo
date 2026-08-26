/**
 * Backgrounding is the gap the browser client's own optimization doesn't
 * cover here: `polling.ts` pauses on `document.visibilitychange`, guarded by
 * `typeof document !== "undefined"` — a no-op in React Native, which has no
 * `document`. Left alone, both the SSE connection and the polling fallback
 * keep running while the app is backgrounded, until (on iOS) the OS
 * suspends the JS runtime out from under them a short while later — wasting
 * battery/data in the meantime, and holding a stream open that the OS may
 * kill uncleanly rather than close.
 *
 * `client.realtime` exposes `connect()`/`disconnect()` for exactly this:
 * a host controlling the lifecycle independent of whatever hooks are
 * mounted (`docs/decisions/0016`, `packages/client/src/client.ts`). This
 * wraps that in an `AppState` listener.
 */
import { AppState, type AppStateStatus } from "react-native";

/** The minimal surface this needs from a chatpack client — matches `ChatClient["realtime"]`. */
export interface RealtimeLifecycle {
  connect(): void;
  disconnect(): void;
}

export interface AttachAppStateLifecycleOptions {
  /**
   * Delay before disconnecting after backgrounding, in ms. Default 0.
   * iOS reports a transient `"inactive"` state on every foreground/background
   * transition (app switcher, an incoming call, a permission sheet) before
   * settling into `"active"` or `"background"` — this only fires on
   * `"background"`, so `"inactive"` alone never triggers a disconnect and a
   * delay is rarely needed. Raise it if you see reconnect churn from a
   * specific device/OS combination in practice.
   */
  disconnectDelayMs?: number;
}

/**
 * Disconnects `client.realtime` when the app backgrounds and reconnects
 * when it returns to the foreground. Call once per client instance (e.g. in
 * a root component's `useEffect`), and call the returned function to detach
 * when that client is torn down.
 */
export function attachAppStateRealtimeLifecycle(
  client: RealtimeLifecycle,
  options: AttachAppStateLifecycleOptions = {},
): () => void {
  const delay = options.disconnectDelayMs ?? 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let current: AppStateStatus = AppState.currentState;

  const clearPendingDisconnect = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const handleChange = (next: AppStateStatus): void => {
    const previous = current;
    current = next;

    if (next === "active" && previous !== "active") {
      clearPendingDisconnect();
      client.connect();
      return;
    }

    if (next === "background" && previous !== "background") {
      clearPendingDisconnect();
      if (delay > 0) {
        timer = setTimeout(() => client.disconnect(), delay);
      } else {
        client.disconnect();
      }
    }
    // "inactive" (iOS-only transient state) is deliberately ignored.
  };

  const subscription = AppState.addEventListener("change", handleChange);

  return () => {
    clearPendingDisconnect();
    subscription.remove();
  };
}
