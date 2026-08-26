/**
 * NativeWind auto-patches RN's own core components (View, Text, Pressable,
 * ScrollView, ...) so `className` "just works" on them anywhere in the
 * tree, including inside this package, once the host app's NativeWind
 * babel/metro transform is active — no dependency on this package needed.
 * FlashList is third-party, though, and NativeWind doesn't know to patch
 * it without an explicit `cssInterop` registration. This does that
 * registration, but only if `nativewind` is actually installed — the peer
 * dependency is optional (`peerDependenciesMeta`), so requiring it
 * unconditionally would break every consumer who isn't using Tailwind.
 */
let registered = false;

export function registerNativeWindInterop(component: unknown): void {
  if (registered) return;
  registered = true;
  try {
    // Metro's module system provides `require` at runtime regardless of
    // whether this file is authored/compiled as ESM — dynamic require is
    // the only way to make this genuinely optional at the module-resolution
    // level, since a static `import "nativewind"` would fail to resolve in
    // any app that hasn't installed it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nativewind = (require as (id: string) => { cssInterop?: (c: unknown, mapping: Record<string, string>) => void })(
      "nativewind",
    );
    nativewind.cssInterop?.(component, { className: "style" });
  } catch {
    // nativewind isn't installed — className on MessageScroller is then a
    // harmless unused prop, same as passing any unrecognized prop to a
    // React Native component.
  }
}
