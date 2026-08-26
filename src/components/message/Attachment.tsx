import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { useChatUI } from "../../context/ChatUIProvider";
import { useMessageContext } from "./context";

/**
 * Chatpack's core has no media pipeline (`docs`: "does not store device
 * tokens" and no attachment table) — an attachment is an app convention
 * living in `Message.metadata`. This is that convention's shape; apps that
 * write attachments into `metadata.attachments` on send get this rendering
 * for free, apps with a different convention pass `attachment` explicitly
 * per instance instead of relying on `Attachment.fromMessage`.
 */
export interface ChatAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name?: string;
  /** Bytes, for the file-card size label. */
  size?: number;
  width?: number;
  height?: number;
}

export function attachmentsFromMetadata(metadata: Record<string, unknown>): ChatAttachment[] {
  const raw = metadata["attachments"];
  return Array.isArray(raw) ? (raw as ChatAttachment[]) : [];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface AttachmentProps {
  attachment: ChatAttachment;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** File/image card — corresponds to shadcn's `Attachment`. */
export function Attachment({ attachment, style, className }: AttachmentProps) {
  const { state, actions } = useChatUI();
  const { message } = useMessageContext();
  const { colors, radius, spacing, typography } = state.theme;

  const onPress = () => actions.onOpenAttachment?.(attachment.id, message.id);

  if (attachment.type === "image") {
    return (
      <Pressable
        onPress={onPress}
        style={[{ borderRadius: radius.md, overflow: "hidden" }, style]}
        // @ts-expect-error forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
        className={className}
      >
        <Image
          source={{ uri: attachment.url }}
          style={{
            width: attachment.width ?? 220,
            height: attachment.height ?? 220,
            backgroundColor: colors.surface,
          }}
          contentFit="cover"
          transition={150}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fileCard,
        { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, borderColor: colors.border },
        style,
      ]}
      // @ts-expect-error forwarded for NativeWind's cssInterop; harmless unknown prop otherwise.
      className={className}
    >
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: colors.foreground, fontSize: typography.body }}>
          {attachment.name ?? "Attachment"}
        </Text>
        {attachment.size !== undefined && (
          <Text style={{ color: colors.mutedForeground, fontSize: typography.caption }}>
            {formatBytes(attachment.size)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 180,
  },
});
