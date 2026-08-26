import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ChatMessage, ChatReceiptState } from "../types";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export type ReceiptStatus = "sent" | "delivered" | "read";
export type ReceiptVariant = "text" | "icon";

/**
 * Derives one message's status from `useReceipts`' per-conversation
 * watermark (`ReceiptState`: `deliveredSeq`, `readMessageId`) — Chatpack
 * tracks receipts as "read/delivered up to here", not a per-message ledger,
 * which is also why apps conventionally show this indicator only on the
 * sender's *last* message rather than on every bubble (repeating it on
 * every prior message would just be restating the same watermark).
 */
export function resolveReceiptStatus(message: ChatMessage, receipt: ChatReceiptState | null | undefined): ReceiptStatus {
  if (!receipt) return "sent";
  if (receipt.readMessageId === message.id) return "read";
  if (receipt.deliveredSeq !== undefined && message.seq <= receipt.deliveredSeq) return "delivered";
  return "sent";
}

export interface ReadReceiptProps {
  status: ReceiptStatus;
  /**
   * `"text"` (default, unchanged): "Sent"/"Delivered"/"Read". `"icon"`: a
   * single check for `"sent"`, a double check for `"delivered"`, and a
   * double check tinted with the theme's accent color for `"read"` — the
   * single-check/double-check/colored-double-check pattern most chat apps
   * use. Both are first-class, not one "real" version and one bolted-on
   * alternative — pick whichever fits, or swap in your own by not using
   * this component at all (`resolveReceiptStatus` is the reusable part).
   */
  variant?: ReceiptVariant;
  style?: StyleProp<TextStyle> | StyleProp<ViewStyle>;
  className?: string;
}

const LABEL: Record<ReceiptStatus, string> = {
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

/**
 * The small status indicator under your own sent message.
 *
 * Intentionally has no opinion on *which* message to render this under —
 * typically only your own last message in the list, computed in your
 * `ItemComponent` (e.g. `index === messages.length - 1 && message.senderId === currentUserId`).
 */
export function ReadReceipt({ status, variant = "text", style, className }: ReadReceiptProps) {
  const { state } = useChatUI();
  const { colors, typography } = state.theme;

  if (variant === "icon") {
    const color = status === "read" ? colors.accent : colors.mutedForeground;
    return (
      <View
        style={[{ flexDirection: "row" }, style as StyleProp<ViewStyle>]}
        accessibilityLabel={LABEL[status]}
        {...classNameProps(className)}
      >
        <Ionicons name={status === "sent" ? "checkmark" : "checkmark-done"} size={typography.timestamp + 3} color={color} />
      </View>
    );
  }

  return (
    <Text
      style={[{ color: colors.mutedForeground, fontSize: typography.timestamp }, style as StyleProp<TextStyle>]}
      {...classNameProps(className)}
    >
      {LABEL[status]}
    </Text>
  );
}
