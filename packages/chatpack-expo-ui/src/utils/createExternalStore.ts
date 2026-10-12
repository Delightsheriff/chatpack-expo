/**
 * Minimal external store for `useSyncExternalStore` — lets
 * `MessageScroller` push visibility/scrollable-edge updates from an
 * imperative scroll callback without triggering a React re-render of the
 * scroller (or transcript rows) itself. Only components that actually call
 * the corresponding hook (`useMessageScrollerVisibility`,
 * `useMessageScrollerScrollable`) re-render when the value changes —
 * "pay for what you use," matching shadcn's own stated performance goal.
 */
export interface ExternalStore<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (callback: () => void) => () => void;
}

export function createExternalStore<T>(initial: T): ExternalStore<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
