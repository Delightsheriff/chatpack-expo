import { Text, type StyleProp, type TextStyle } from "react-native";
import type { ChatMessage, ChatReceiptState } from "../types";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export type ReceiptStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface MessageWithDeliveryStatus extends ChatMessage {
  deliveryStatus?: ReceiptStatus;
}

/**
 * Derives one message's delivery/read status from optimistic state and `useReceipts` watermark.
 */
export function resolveReceiptStatus(
  message: MessageWithDeliveryStatus,
  receipt: ChatReceiptState | null | undefined,
): ReceiptStatus {
  if (message.deliveryStatus === "sending") return "sending";
  if (message.deliveryStatus === "failed") return "failed";
  if (!receipt) return message.deliveryStatus ?? "sent";
  if (receipt.readMessageId === message.id) return "read";
  if (receipt.deliveredSeq !== undefined && message.seq <= receipt.deliveredSeq) return "delivered";
  return message.deliveryStatus ?? "sent";
}

export interface ReadReceiptProps {
  status: ReceiptStatus;
  variant?: "icon" | "text";
  style?: StyleProp<TextStyle>;
  className?: string;
}

const LABEL: Record<ReceiptStatus, string> = {
  sending: "Sending...",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed to send",
};

const ICONS: Record<ReceiptStatus, string> = {
  sending: "🕒",
  sent: "✓",
  delivered: "✓✓",
  read: "✓✓",
  failed: "⚠️",
};

/**
 * The status indicator under your own sent message.
 * Supports WhatsApp-style icons (🕒, ✓, ✓✓, ⚠️) via variant="icon" or text via variant="text".
 */
export function ReadReceipt({ status, variant = "text", style, className }: ReadReceiptProps) {
  const { state } = useChatUI();

  const isRead = status === "read";
  const isFailed = status === "failed";
  const color = isFailed
    ? "#EF4444"
    : isRead && variant === "icon"
      ? "#34B7F1" // WhatsApp blue double-check
      : state.theme.colors.mutedForeground;

  const content = variant === "icon" ? ICONS[status] : LABEL[status];

  return (
    <Text
      style={[
        {
          color,
          fontSize: variant === "icon" ? 12 : state.theme.typography.timestamp,
          fontWeight: isRead ? "700" : "400",
        },
        style,
      ]}
      {...classNameProps(className)}
    >
      {content}
    </Text>
  );
}
