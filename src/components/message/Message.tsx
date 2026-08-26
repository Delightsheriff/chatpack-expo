import { useMemo, type ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { ClientMessage } from "@chatpack/client";
import { useChatUI } from "../../context/ChatUIProvider";
import { isSameGroup } from "../../utils/grouping";
import { MessageContext } from "./context";

export interface MessageProps {
  message: ClientMessage;
  /** Neighbors in the (chronologically ascending) list, for grouping — pass `undefined` at the edges. */
  previousMessage?: ClientMessage;
  nextMessage?: ClientMessage;
  /** Grouping window override; see `isSameGroup`. */
  groupingWindowMs?: number;
  /**
   * `Bubble`, `Attachment`, `Marker`, or any custom child — this root only
   * lays out the row (avatar slot + content column) and provides context;
   * it renders nothing about the message itself, so swapping in a
   * different bubble implementation never requires forking this file.
   */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Forwarded to the row's `View` for NativeWind (or any Tailwind-in-RN setup); harmless unknown prop if you're not using one. */
  className?: string;
}

/**
 * Row root for one message: computes ownership/grouping once and provides
 * it via context to `Message.Bubble` / `Message.Attachment`, mirroring
 * shadcn's `Message` (avatar + alignment + grouped-message layout) —
 * `architecture-compound-components`, so a consumer composes
 * `<Message><Message.Bubble/></Message>` rather than configuring one
 * component with a dozen booleans.
 */
export function Message({
  message,
  previousMessage,
  nextMessage,
  groupingWindowMs,
  children,
  style,
  className,
}: MessageProps) {
  const { state } = useChatUI();
  const isOwn = message.senderId === state.currentUserId;

  const contextValue = useMemo(
    () => ({
      message,
      isOwn,
      groupedWithPrevious: isSameGroup(previousMessage, message, groupingWindowMs),
      groupedWithNext: isSameGroup(message, nextMessage, groupingWindowMs),
    }),
    [message, isOwn, previousMessage, nextMessage, groupingWindowMs],
  );

  return (
    <MessageContext.Provider value={contextValue}>
      <View
        style={[
          styles.row,
          { justifyContent: isOwn ? "flex-end" : "flex-start" },
          contextValue.groupedWithPrevious ? styles.tightTop : styles.spacedTop,
          style,
        ]}
        // @ts-expect-error forwarded for NativeWind's cssInterop when the host app has the babel/metro transform active; harmless unknown prop otherwise.
        className={className}
      >
        {children}
      </View>
    </MessageContext.Provider>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  spacedTop: {
    marginTop: 12,
  },
  tightTop: {
    marginTop: 2,
  },
});

export { useMessageContext } from "./context";
export type { MessageContextValue } from "./context";
