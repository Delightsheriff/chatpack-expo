import { useMemo, useState, useCallback, type ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { ChatMessage } from "../../types";
import { useChatUI } from "../../context/ChatUIProvider";
import { useSlots } from "../../customization/useSlots";
import type { SlotProps } from "../../customization/slots";
import { isSameGroup } from "../../utils/grouping";
import { MessageContext, type MessageAlign } from "./context";
import { MessageAvatarAlignmentContext } from "./avatar-alignment";

export type { MessageAlign };

export interface MessageProps extends SlotProps<"Message"> {
  message: ChatMessage;
  /** Neighbors in the (chronologically ascending) list, for grouping — pass `undefined` at the edges. */
  previousMessage?: ChatMessage | undefined;
  nextMessage?: ChatMessage | undefined;
  /** Grouping window override; see `isSameGroup`. */
  groupingWindowMs?: number;
  /** Defaults to derived from `isOwn` (`"end"` for your own messages) — override for group-chat cases where alignment isn't purely ownership. */
  align?: MessageAlign;
  /**
   * `MessageAvatar` + `MessageContent` (which itself holds
   * `MessageHeader`/`Bubble`/`MessageFooter`) — this root only lays out the
   * row and provides context; it renders nothing about the message itself.
   */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Row root for one message — corresponds to shadcn's `Message`. Computes
 * ownership/grouping once and provides it via context to
 * `MessageAvatar`/`Bubble`/`MessageFooter`, so a consumer composes
 * `<Message><MessageAvatar/><MessageContent>...</MessageContent></Message>`
 * rather than configuring one component with a dozen booleans.
 *
 * Slots: `root`.
 */
export function Message({
  message,
  previousMessage,
  nextMessage,
  groupingWindowMs,
  align,
  children,
  style,
  className,
  styles: slotStyles,
  classNames,
}: MessageProps) {
  const { state } = useChatUI();
  const { spacing } = state.theme;
  const isOwn = message.senderId === state.currentUserId;
  const resolvedAlign: MessageAlign = align ?? (isOwn ? "end" : "start");

  const [footerHeight, setFooterHeight] = useState(0);
  const reportFooterHeight = useCallback((height: number) => setFooterHeight(height), []);
  const avatarAlignmentValue = useMemo(() => ({ footerHeight, reportFooterHeight }), [footerHeight, reportFooterHeight]);

  const contextValue = useMemo(
    () => ({
      message,
      isOwn,
      align: resolvedAlign,
      groupedWithPrevious: isSameGroup(previousMessage, message, groupingWindowMs),
      groupedWithNext: isSameGroup(message, nextMessage, groupingWindowMs),
    }),
    [message, isOwn, resolvedAlign, previousMessage, nextMessage, groupingWindowMs],
  );

  const slots = useSlots("Message", { styles: slotStyles, classNames }, {
    isOwn,
    align: resolvedAlign,
    groupedWithPrevious: contextValue.groupedWithPrevious,
    groupedWithNext: contextValue.groupedWithNext,
  });

  return (
    <MessageContext.Provider value={contextValue}>
      <MessageAvatarAlignmentContext.Provider value={avatarAlignmentValue}>
        <View
          style={[
            styles.row,
            // `flexDirection` alone puts an own ("end") message on the
            // right: "row-reverse" flips which physical side is the main
            // axis's *start*, so packing toward "flex-start" (Yoga's
            // default — deliberately not overridden per alignment) lands
            // on the right for a reversed row and the left for a normal
            // one. Setting `justifyContent: "flex-end"` for "end" here
            // used to double-flip that and push own messages to the left
            // instead — the same bug CSS's `row-reverse` catches everyone
            // out on at least once.
            { flexDirection: resolvedAlign === "end" ? "row-reverse" : "row", paddingHorizontal: spacing.md, gap: spacing.sm },
            { marginTop: contextValue.groupedWithPrevious ? 2 : spacing.md },
            slots.style("root"),
            style,
          ]}
          {...slots.className("root", className)}
        >
          {children}
        </View>
      </MessageAvatarAlignmentContext.Provider>
    </MessageContext.Provider>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-end",
  },
});

export { useMessageContext } from "./context";
export type { MessageContextValue } from "./context";
