import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ChatMessage, ChatReceiptState } from "../types";
import { useChatUI } from "../context/ChatUIProvider";
import { ChatIcon, type ChatIconName } from "../customization/icons";
import { useSlots } from "../customization/useSlots";
import { fontStyle } from "../customization/resolveSlots";
import type { SlotProps } from "../customization/slots";

export type ReceiptStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface MessageWithDeliveryStatus extends ChatMessage {
  deliveryStatus?: ReceiptStatus | undefined;
}

/**
 * Derives one message's delivery/read status from optimistic state and the
 * `useReceipts` watermark.
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

export interface ReadReceiptProps extends SlotProps<"ReadReceipt"> {
  status: ReceiptStatus;
  /** `"icon"`: native ticks (clock / ✓ / ✓✓ / ✓✓ tinted / !). `"text"`: `labels.receipt[status]`. */
  variant?: "icon" | "text";
  /** Icon size for `variant="icon"`. Default 14. */
  size?: number;
  /** Root style: the icon wrapper for `"icon"`, the text for `"text"`. */
  style?: StyleProp<TextStyle & ViewStyle>;
  className?: string;
}

const ICON: Record<ReceiptStatus, ChatIconName> = {
  sending: "receiptSending",
  sent: "receiptSent",
  delivered: "receiptDelivered",
  read: "receiptRead",
  failed: "receiptFailed",
};

/**
 * The status indicator under your own sent message. Icons come from the
 * provider's icon map (`receiptSending` … `receiptFailed`), colors from
 * `colors.receiptRead` / `colors.destructive` / `colors.mutedForeground`.
 * Always carries the text label for screen readers.
 *
 * Slots: `root` (icon wrapper), `text`. Replace app-wide with
 * `components={{ ReadReceipt: MyReceipt }}`.
 */
export function ReadReceipt({ status, variant = "text", size = 14, style, className, styles: slotStyles, classNames }: ReadReceiptProps) {
  const { state, config } = useChatUI();
  const theme = state.theme;
  const { colors, typography } = theme;
  const slots = useSlots("ReadReceipt", { styles: slotStyles, classNames }, { status, variant });
  const label = config.labels.receipt[status];

  const color = status === "failed" ? colors.destructive : status === "read" && variant === "icon" ? colors.receiptRead : colors.mutedForeground;

  if (variant === "icon") {
    return (
      <View
        accessible
        accessibilityLabel={label}
        style={[{ flexDirection: "row", alignItems: "center" }, slots.style("root"), style as StyleProp<ViewStyle>]}
        {...slots.className("root", className)}
      >
        <ChatIcon name={ICON[status]} size={size} color={color} />
      </View>
    );
  }

  return (
    <Text
      style={[{ color, fontSize: typography.timestamp }, fontStyle(theme, status === "read" ? "semibold" : "regular"), slots.style("text"), style]}
      {...slots.className("text", className)}
    >
      {label}
    </Text>
  );
}
