import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DesignPreviewScreen } from "./screens/DesignPreviewScreen";

// Pure UI preview — no chatpack-expo, no backend, just chatpack-expo-ui
// with hardcoded mock messages. The real backend-wired flow (ChatListScreen /
// ConversationScreen, lib/chat.ts) is still in this project, just not
// rendered from here right now — swap this back to reach it again.
export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <DesignPreviewScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
