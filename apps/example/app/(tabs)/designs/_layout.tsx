import { Stack } from "expo-router";

export default function DesignsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Designs", headerLargeTitleEnabled: true, headerLargeTitleShadowVisible: false }} />
    </Stack>
  );
}
