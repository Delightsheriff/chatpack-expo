import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import { SymbolView } from "expo-symbols";
import { DESIGNS } from "../../../lib/designs";

/** The same conversation rendered four ways — only themes, slots, labels and overrides differ. */
export default function DesignsScreen() {
  const dark = useColorScheme() === "dark";
  const fg = dark ? "#FAFAFA" : "#18181B";
  const muted = dark ? "#A1A1AA" : "#71717A";
  const card = dark ? "#18181B" : "#FFFFFF";

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12 }}>
      {DESIGNS.map((design) => {
        const theme = dark ? design.theme.dark : design.theme.light;
        return (
          <Link key={design.key} href={{ pathname: "/preview/[design]", params: { design: design.key } }} asChild>
            <Pressable style={({ pressed }) => ({ backgroundColor: card, borderRadius: 14, padding: 16, gap: 10, opacity: pressed ? 0.7 : 1 })}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: fg, fontSize: 17, fontWeight: "600" }}>{design.name}</Text>
                  <Text style={{ color: muted, fontSize: 13, marginTop: 2 }}>{design.description}</Text>
                </View>
                <SymbolView name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }} size={14} tintColor={muted} />
              </View>
              <View style={{ backgroundColor: theme.colors.background, borderRadius: 10, padding: 10, gap: 6 }}>
                {/* The Flat design unframes bubbles through a slot, so its card shows plain left-aligned text. */}
                <Bubble text="Did you see the new designs?" bg={design.flat ? "transparent" : theme.colors.bubbleReceived} fg={theme.colors.bubbleReceivedForeground} radius={theme.bubble.radius} />
                <Bubble text="Shipping it today 🚀" bg={design.flat ? "transparent" : theme.colors.bubbleSent} fg={theme.colors.bubbleSentForeground} radius={theme.bubble.radius} own={!design.flat} />
              </View>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

function Bubble({ text, bg, fg, radius, own }: { text: string; bg: string; fg: string; radius: number; own?: boolean }) {
  return (
    <View style={{ alignSelf: own ? "flex-end" : "flex-start", backgroundColor: bg, borderRadius: Math.min(radius, 16), paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: fg, fontSize: 14 }}>{text}</Text>
    </View>
  );
}
