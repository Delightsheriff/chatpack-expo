import { Pressable, Text, View } from "react-native";
import { ChatIcon, useChatTheme, type ChatMessage } from "chatpack-expo-ui";

/** "Replying to …" bar for the composer's `topAccessory`. App code — restyle at will. */
export function ReplyBar({ target, onCancel }: { target: ChatMessage; onCancel: () => void }) {
  const { colors, radius, spacing, typography } = useChatTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.accent, fontSize: typography.caption, fontWeight: "600" }}>Replying to {target.senderId}</Text>
        <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: typography.caption }}>
          {target.body}
        </Text>
      </View>
      <Pressable onPress={onCancel} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel reply">
        <ChatIcon name="close" size={16} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}
