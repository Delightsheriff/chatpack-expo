import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChatSessionProvider } from "../lib/session";

/**
 * App root. Each provider is here once, for the whole app:
 * - GestureHandlerRootView — swipe-to-reply and other gestures.
 * - KeyboardProvider — required by chatpack-expo-ui's ChatKeyboardView.
 * - ThemeProvider — native headers/tab bar follow light/dark without flashes.
 * - ChatSessionProvider — the demo user and their chat client.
 */
export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
          <ChatSessionProvider>
            <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="conversation/[id]" options={{ headerTitleAlign: "center" }} />
              <Stack.Screen name="preview/[design]" options={{ headerTitleAlign: "center" }} />
            </Stack>
            <StatusBar style="auto" />
          </ChatSessionProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
