import { createContext, useContext, type Context } from "react";

/**
 * Factory for the "createContext, default it to null, throw a clear error
 * from a hook if it's still null" pattern — hand-rolled six times across
 * `ChatUIProvider`, `message/context.ts`, `message/avatar-alignment.ts`,
 * `attachment/context.ts`, `marker/context.ts`, and `scroller/context.ts`
 * before this (architecture review, 2026-08-26, candidate 5). One factory,
 * six call sites, instead of six near-identical copies with six slightly
 * different error messages.
 *
 * `componentName` is deliberately just a label for the error message, not
 * the actual JSX name — pass whatever reads best in "must be used inside
 * a <{componentName}>".
 */
export function createRequiredContext<T>(componentName: string): readonly [Context<T | null>, () => T] {
  const context = createContext<T | null>(null);

  function useRequiredContext(): T {
    const value = useContext(context);
    if (value === null) {
      throw new Error(`This must be used inside a <${componentName}>.`);
    }
    return value;
  }

  return [context, useRequiredContext] as const;
}
