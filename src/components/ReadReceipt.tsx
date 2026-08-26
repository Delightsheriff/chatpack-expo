import { Text, type StyleProp, type TextStyle } from "react-native";
import type { ClientMessage } from "@chatpack/client";
import type { ReceiptState } from "@chatpack/client/plugins";
import { useChatUI } from "../context/ChatUIProvider";
import { classNameProps } from "../utils/classNameProps";

export type ReceiptStatus = "sent" | "delivered" | "read";

/**
 * Derives one message's status from `useReceipts`' per-conversation
 * watermark (`ReceiptState`: `deliveredSeq`, `readMessageId`) — Chatpack
 * tracks receipts as "read/delivered up to here", not a per-message ledger,
 * which is also why apps conventionally show this indicator only on the
 * sender's *last* message rather than on every bubble (repeating it on
 * every prior message would just be restating the same watermark).
 */
export function resolveReceiptStatus(message: ClientMessage, receipt: ReceiptState | null | undefined): ReceiptStatus {
  if (!receipt) return "sent";
  if (receipt.readMessageId === message.id) return "read";
  if (receipt.deliveredSeq !== undefined && message.seq <= receipt.deliveredSeq) return "delivered";
  return "sent";
}

export interface ReadReceiptProps {
  status: ReceiptStatus;
  style?: StyleProp<TextStyle>;
  className?: string;
}

const LABEL: Record<ReceiptStatus, string> = {
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

/**
 * The small status line under your own sent message. Deliberately just
 * text, not a tri-state checkmark icon set — swap this for your own
 * icon-based version by not using it at all; `resolveReceiptStatus` is the
 * part worth reusing.
 *
 * Intentionally has no opinion on *which* message to render this under —
 * typically only your own last message in the list, computed in your
 * `ItemComponent` (e.g. `index === messages.length - 1 && message.senderId === currentUserId`).
 */
export function ReadReceipt({ status, style, className }: ReadReceiptProps) {
  const { state } = useChatUI();
  return (
    <Text
      style={[{ color: state.theme.colors.mutedForeground, fontSize: state.theme.typography.timestamp }, style]}
      {...classNameProps(className)}
    >
      {LABEL[status]}
    </Text>
  );
}
