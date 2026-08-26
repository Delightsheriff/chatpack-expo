import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // react-native itself is never bundled — it's the host runtime.
  external: ["react", "react-native", "@chatpack/client"],
});
