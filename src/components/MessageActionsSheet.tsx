import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import type { ChatMessage } from "../types";
import { useChatUI, type ChatUIActions } from "../context/ChatUIProvider";

export const DEFAULT_QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export interface MessageAction {
  id: string;
  label: string;
  variant?: "filled" | "outlined" | "text";
  onPress: () => void;
}

export function buildDefaultMessageActions(
  message: ChatMessage,
  actions: ChatUIActions,
): MessageAction[] {
  const list: MessageAction[] = [];
  if (actions.onReply) {
    list.push({ id: "reply", label: "Reply", onPress: () => actions.onReply?.(message.id) });
  }
  if (actions.onCopyMessage) {
    list.push({
      id: "copy",
      label: "Copy Text",
      variant: "outlined",
      onPress: () => actions.onCopyMessage?.(message.id),
    });
  }
  if (actions.onDeleteMessage) {
    list.push({
      id: "delete",
      label: "Delete Message",
      variant: "text",
      onPress: () => actions.onDeleteMessage?.(message.id),
    });
  }
  return list;
}

export interface MessageActionsSheetProps {
  message: ChatMessage | null;
  isPresented: boolean;
  onDismiss: () => void;
  actions?: MessageAction[];
  quickReactions?: string[];
}

/**
 * Clean, high-performance modal sheet for message actions & quick reactions.
 * Built with pure React Native primitives (no experimental native-module dependencies).
 */
export function MessageActionsSheet({
  message,
  isPresented,
  onDismiss,
  actions: actionsOverride,
  quickReactions,
}: MessageActionsSheetProps) {
  const { actions: chatActions, state } = useChatUI();
  const theme = state.theme;

  if (!message) return null;

  const resolvedActions = actionsOverride ?? buildDefaultMessageActions(message, chatActions);
  const resolvedQuickReactions =
    quickReactions ?? (chatActions.onReact ? DEFAULT_QUICK_REACTIONS : []);

  const runThenDismiss = (fn: () => void) => () => {
    fn();
    onDismiss();
  };

  if (resolvedActions.length === 0 && resolvedQuickReactions.length === 0) return null;

  return (
    <Modal
      visible={isPresented}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Quick Reactions Bar */}
              {resolvedQuickReactions.length > 0 && (
                <View style={styles.reactionsContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                    React
                  </Text>
                  <View style={styles.reactionsRow}>
                    {resolvedQuickReactions.map((emoji) => (
                      <Pressable
                        key={emoji}
                        style={({ pressed }) => [
                          styles.reactionButton,
                          {
                            backgroundColor: pressed
                              ? theme.colors.surface
                              : theme.colors.background,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={runThenDismiss(() =>
                          chatActions.onReact?.(message.id, emoji),
                        )}
                      >
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {resolvedActions.map((action) => {
                  const isDestructive = action.id === "delete";
                  return (
                    <Pressable
                      key={action.id}
                      style={({ pressed }) => [
                        styles.actionButton,
                        {
                          backgroundColor: pressed
                            ? theme.colors.surface
                            : "transparent",
                        },
                      ]}
                      onPress={runThenDismiss(action.onPress)}
                    >
                      <Text
                        style={[
                          styles.actionText,
                          {
                            color: isDestructive
                              ? theme.colors.destructive
                              : theme.colors.foreground,
                          },
                        ]}
                      >
                        {action.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Cancel Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: pressed
                      ? theme.colors.surface
                      : theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onDismiss}
              >
                <Text style={[styles.cancelText, { color: theme.colors.mutedForeground }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 32,
  },
  reactionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmoji: {
    fontSize: 22,
  },
  actionsContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export type { ChatUIActions };
