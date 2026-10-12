/**
 * RN core components don't type a `className` prop — it's only meaningful
 * once NativeWind's babel/metro transform patches them at the app level
 * (`cssInterop`), which this package has no compile-time knowledge of.
 * Every component that forwards `className` needs the same suppressed
 * type error to pass it through; this collects that single fact in one
 * place instead of repeating the same `@ts-expect-error` comment at every
 * call site (`architecture review, 2026-08-26, candidate 1`).
 *
 * Spread the result rather than passing `className` directly, so an
 * `undefined` className is never explicitly set as a prop (harmless
 * either way, but keeps rendered prop lists clean for anyone inspecting
 * them):
 *
 * ```tsx
 * <View {...classNameProps(className)} style={...} />
 * ```
 */
export function classNameProps(className: string | undefined): { className?: string } {
  return className === undefined ? {} : { className };
}
