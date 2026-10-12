import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ChatMessage } from "../types";
import { useChatUI, type ChatUIActions, type ChatUIConfig } from "../context/ChatUIProvider";
import { ChatIcon, type ChatIconName } from "../customization/icons";
import { useSlots } from "../customization/useSlots";
import { fontStyle } from "../customization/resolveSlots";
import type { SlotProps } from "../customization/slots";
import { DEFAULT_QUICK_REACTIONS } from "./QuickReactionBar";

export { DEFAULT_QUICK_REACTIONS };

export interface MessageAction {
  id: string;
  label: string;
  /** A package icon name, or any node. */
  icon?: ChatIconName | ReactNode;
  /** Renders in the destructive color (Delete, Report…). */
  destructive?: boolean;
  /** @deprecated Styling hint from the first version; use slot styles instead. */
  variant?: "filled" | "outlined" | "text";
  onPress: () => void;
}

/**
 * The default action list for a message: Reply, Copy, Forward, Delete —
 * each only when it applies (an action prop is wired, the message has
 * text, it isn't deleted). Copy works with no wiring at all: it uses
 * `config.copyText` (system clipboard) unless `onCopyMessage` replaces it.
 *
 * Spread and extend it for app-specific actions:
 *
 * ```ts
 * const actions = [...buildDefaultMessageActions(message, ui.actions, ui.config),
 *   { id: "pin", label: "Pin", icon: "add", onPress: () => pin(message.id) }];
 * ```
 */
export function buildDefaultMessageActions(
  message: ChatMessage,
  actions: ChatUIActions,
  config?: Pick<ChatUIConfig, "labels" | "copyText" | "haptics">,
): MessageAction[] {
  const labels = config?.labels;
  const deleted = message.deletedAt !== null;
  const list: MessageAction[] = [];
  if (deleted) return list;

  if (actions.onReply) {
    list.push({ id: "reply", label: labels?.reply ?? "Reply", icon: "reply", onPress: () => actions.onReply?.(message.id) });
  }
  const copy = actions.onCopyMessage
    ? () => actions.onCopyMessage?.(message.id)
    : config
      ? () => {
          void config.copyText(message.body);
          config.haptics("copy");
        }
      : undefined;
  if (copy && message.body.length > 0) {
    list.push({ id: "copy", label: labels?.copy ?? "Copy", icon: "copy", onPress: copy });
  }
  if (actions.onForwardMessage) {
    list.push({ id: "forward", label: labels?.forward ?? "Forward", icon: "forward", onPress: () => actions.onForwardMessage?.(message.id) });
  }
  if (actions.onDeleteMessage) {
    list.push({
      id: "delete",
      label: labels?.delete ?? "Delete",
      icon: "delete",
      destructive: true,
      onPress: () => actions.onDeleteMessage?.(message.id),
    });
  }
  return list;
}

export interface MessageActionsSheetProps extends SlotProps<"MessageActionsSheet"> {
  message: ChatMessage | null;
  isPresented: boolean;
  onDismiss: () => void;
  /** Replaces the default actions. Build on `buildDefaultMessageActions` to extend instead. */
  actions?: MessageAction[];
  /** Emoji row; defaults to `DEFAULT_QUICK_REACTIONS` when `onReact` is wired, `[]` to hide. */
  quickReactions?: string[];
  /** Content above the reactions — e.g. a preview of the pressed message. */
  header?: ReactNode;
}

/**
 * Bottom sheet of message actions and quick reactions. Render one per
 * screen (not per row) and drive it from the pressed message.
 *
 * Slots: `backdrop`, `sheet`, `sectionTitle`, `reactionsRow`,
 * `reactionButton`, `reactionEmoji`, `actions`, `actionButton`,
 * `actionText`, `cancelButton`, `cancelText`. Item slots get `pressed`
 * and `destructive`.
 */
export function MessageActionsSheet({
  message,
  isPresented,
  onDismiss,
  actions: actionsOverride,
  quickReactions,
  header,
  styles: slotStyles,
  classNames,
}: MessageActionsSheetProps) {
  const { actions: chatActions, state, config } = useChatUI();
  const theme = state.theme;
  const { colors, radius, spacing, typography } = theme;
  const slots = useSlots("MessageActionsSheet", { styles: slotStyles, classNames }, { pressed: false, destructive: false });

  if (!message) return null;

  const resolvedActions = actionsOverride ?? buildDefaultMessageActions(message, chatActions, config);
  const resolvedQuickReactions = quickReactions ?? (chatActions.onReact && message.deletedAt === null ? DEFAULT_QUICK_REACTIONS : []);

  const runThenDismiss = (fn: () => void) => () => {
    fn();
    onDismiss();
  };

  if (resolvedActions.length === 0 && resolvedQuickReactions.length === 0) return null;

  return (
    <Modal visible={isPresented} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }, slots.style("backdrop")]} {...slots.className("backdrop")}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel={config.labels.cancel} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderTopLeftRadius: radius.lg + 2,
              borderTopRightRadius: radius.lg + 2,
              padding: spacing.lg,
            },
            slots.style("sheet"),
          ]}
          {...slots.className("sheet")}
        >
          {header}

          {resolvedQuickReactions.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[styles.sectionTitle, { color: colors.mutedForeground, marginBottom: spacing.sm }, fontStyle(theme, "semibold"), slots.style("sectionTitle")]}
                {...slots.className("sectionTitle")}
              >
                {config.labels.react}
              </Text>
              <View style={[styles.reactionsRow, slots.style("reactionsRow")]} {...slots.className("reactionsRow")}>
                {resolvedQuickReactions.map((emoji) => (
                  <Pressable
                    key={emoji}
                    accessibilityRole="button"
                    accessibilityLabel={emoji}
                    style={({ pressed }) => [
                      styles.reactionButton,
                      { backgroundColor: pressed ? colors.border : colors.surface, borderRadius: radius.full },
                      slots.style("reactionButton", { pressed }),
                    ]}
                    onPress={runThenDismiss(() => {
                      config.haptics("reaction");
                      chatActions.onReact?.(message.id, emoji);
                    })}
                    {...slots.className("reactionButton")}
                  >
                    <Text style={[{ fontSize: typography.emoji }, slots.style("reactionEmoji")]} {...slots.className("reactionEmoji")}>
                      {emoji}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {resolvedActions.length > 0 && (
            <View
              style={[styles.actions, { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.md }, slots.style("actions")]}
              {...slots.className("actions")}
            >
              {resolvedActions.map((action, index) => {
                const destructive = action.destructive ?? action.id === "delete";
                const tint = destructive ? colors.destructive : colors.foreground;
                return (
                  <Pressable
                    key={action.id}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.actionButton,
                      { paddingHorizontal: spacing.lg, backgroundColor: pressed ? colors.border : "transparent" },
                      index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                      slots.style("actionButton", { pressed, destructive }),
                    ]}
                    onPress={runThenDismiss(action.onPress)}
                    {...slots.className("actionButton")}
                  >
                    <Text
                      style={[{ color: tint, fontSize: typography.body, flex: 1 }, fontStyle(theme, "medium"), slots.style("actionText", { destructive })]}
                      {...slots.className("actionText")}
                    >
                      {action.label}
                    </Text>
                    {typeof action.icon === "string" ? <ChatIcon name={action.icon as ChatIconName} size={18} color={tint} /> : action.icon}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: pressed ? colors.border : colors.surface, borderRadius: radius.md },
              slots.style("cancelButton", { pressed }),
            ]}
            onPress={onDismiss}
            {...slots.className("cancelButton")}
          >
            <Text
              style={[{ color: colors.foreground, fontSize: typography.body }, fontStyle(theme, "semibold"), slots.style("cancelText")]}
              {...slots.className("cancelText")}
            >
              {config.labels.cancel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingBottom: 34,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reactionButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export type { ChatUIActions };
