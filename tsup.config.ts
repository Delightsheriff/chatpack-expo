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
    "@shopify/flash-list",
    "expo-image",
    "expo-linear-gradient",
    "nativewind",
    "react-native-gesture-handler",
    "react-native-reanimated",
    "react-native-worklets",
    "react-native-keyboard-controller",
    "expo-symbols",
    "expo-haptics",
    "expo-clipboard",
    "@expo/vector-icons",
  ],
});
