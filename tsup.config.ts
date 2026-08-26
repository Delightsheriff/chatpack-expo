import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Host runtime + peer libs are never bundled.
  external: [
    "react",
    "react-native",
    "@chatpack/client",
    "@expo/ui",
    "@shopify/flash-list",
    "expo-image",
    "react-native-reanimated",
  ],
});
