import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import { SymbolView } from "expo-symbols";
import { DEMO_USERS } from "../../../lib/chat";
import { useChatSession } from "../../../lib/session";

/** Switch the demo user — open the app on two simulators as different users to test realtime. */
export default function AccountScreen() {
  const { userId, setUserId } = useChatSession();
  const dark = useColorScheme() === "dark";
  const fg = dark ? "#FAFAFA" : "#18181B";
  const muted = dark ? "#A1A1AA" : "#71717A";
  const card = dark ? "#18181B" : "#FFFFFF";
  const border = dark ? "#27272A" : "#E4E4E7";

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 8 }}>
      <Text style={{ color: muted, fontSize: 13, textTransform: "uppercase", marginLeft: 16 }}>Signed in as</Text>
      <View style={{ backgroundColor: card, borderRadius: 12, overflow: "hidden" }}>
        {DEMO_USERS.map((id, index) => (
          <Pressable
            key={id}
            onPress={() => setUserId(id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: id === userId }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 13,
              backgroundColor: pressed ? border : "transparent",
              borderTopWidth: index === 0 ? 0 : 0.5,
              borderTopColor: border,
            })}
          >
            <Text style={{ flex: 1, color: fg, fontSize: 17, textTransform: "capitalize" }}>{id}</Text>
            {id === userId && <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={18} tintColor="#0B84FE" />}
          </Pressable>
        ))}
      </View>
      <Text style={{ color: muted, fontSize: 13, marginHorizontal: 16 }}>
        Uses the local test server (chatpack-expo-server-test). Each user sees their own conversations.
      </Text>
    </ScrollView>
  );
}
