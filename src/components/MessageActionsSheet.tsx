import { BottomSheet, Column, Row, Button, Text } from "@expo/ui";
import type { ChatMessage } from "../types";
import { useChatUI, type ChatUIActions } from "../context/ChatUIProvider";

export const DEFAULT_QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

/**
 * One row in the sheet. This is the escape hatch for anything beyond
 * reply/copy/delete/react — "Forward", "Report", "Pin", app-specific
 * moderation actions, whatever. `buildDefaultMessageActions` gives you the
 * built-in four as a starting array; splice your own `MessageAction`
 * objects into it, or ignore it entirely and pass a fully custom list.
 */
export interface MessageAction {
  id: string;
  label: string;
  /** Maps to universal Button's variant (`filled` default). Universal Button has no destructive/danger styling — see the README note on this. */
  variant?: "filled" | "outlined" | "text";
  onPress: () => void;
}

/**
 * The built-in reply/copy/delete actions, derived from whichever
 * `ChatUIActions` handlers are wired on `<ChatUIProvider>` — omits any
 * action whose handler is absent, same behavior `MessageActionsSheet` had
 * before `actions` became overridable. Exported so a custom action list
 * can extend rather than replace this set:
 *
 * ```tsx
 * const actions = [
 *   ...buildDefaultMessageActions(message, chatActions),
 *   { id: "report", label: "Report", variant: "text", onPress: () => report(message.id) },
 * ];
 * <MessageActionsSheet message={message} actions={actions} isPresented={...} onDismiss={...} />
 * ```
 */
export function buildDefaultMessageActions(message: ChatMessage, actions: ChatUIActions): MessageAction[] {
  const list: MessageAction[] = [];
  if (actions.onReply) {
    list.push({ id: "reply", label: "Reply", onPress: () => actions.onReply?.(message.id) });
  }
  if (actions.onCopyMessage) {
    list.push({ id: "copy", label: "Copy", variant: "outlined", onPress: () => actions.onCopyMessage?.(message.id) });
  }
  if (actions.onForwardMessage) {
    list.push({ id: "forward", label: "Forward", variant: "outlined", onPress: () => actions.onForwardMessage?.(message.id) });
  }
  if (actions.onDeleteMessage) {
    // Universal Button has no destructive/role variant (only
    // filled/outlined/text) — "text" reads as the lowest-emphasis option
    // here, closest to how a destructive action is usually set apart from
    // "Reply" without a real danger color to lean on.
    list.push({ id: "delete", label: "Delete", variant: "text", onPress: () => actions.onDeleteMessage?.(message.id) });
  }
  return list;
}

export interface MessageActionsSheetProps {
  message: ChatMessage;
  isPresented: boolean;
  onDismiss: () => void;
  /**
   * Full override of the action list. Defaults to
   * `buildDefaultMessageActions(message, chatUIActions)` when omitted —
   * pass this to add, remove, or reorder actions, including ones this
   * package has no built-in concept of.
   */
  actions?: MessageAction[];
  /** Quick-reaction row above the actions. Pass `[]` to hide it even when `onReact` is wired. Defaults to `DEFAULT_QUICK_REACTIONS` when `onReact` is present. */
  quickReactions?: string[];
}

/**
 * Long-press actions for one message, rendered with `@expo/ui`'s universal
 * `BottomSheet` so it's a real native sheet on iOS and Android
 * (`ui-native-modals`), not a JS modal skinned to look like one.
 *
 * This component owns *what's in the sheet*, not *whether it's open* — the
 * caller holds `isPresented` (typically local state toggled by `Bubble`'s
 * `onLongPress`), consistent with `state-lift-state`.
 */
export function MessageActionsSheet({
  message,
  isPresented,
  onDismiss,
  actions: actionsOverride,
  quickReactions,
}: MessageActionsSheetProps) {
  const { actions: chatActions } = useChatUI();

  const resolvedActions = actionsOverride ?? buildDefaultMessageActions(message, chatActions);
  const resolvedQuickReactions = quickReactions ?? (chatActions.onReact ? DEFAULT_QUICK_REACTIONS : []);

  const runThenDismiss = (fn: () => void) => () => {
    fn();
    onDismiss();
  };

  if (resolvedActions.length === 0 && resolvedQuickReactions.length === 0) return null;

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss} snapPoints={["half"]}>
      <Column spacing={12}>
        {resolvedQuickReactions.length > 0 && (
          <Column spacing={8}>
            <Text>React</Text>
            <Row spacing={4}>
              {resolvedQuickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="outlined"
                  label={emoji}
                  onPress={runThenDismiss(() => chatActions.onReact?.(message.id, emoji))}
                />
              ))}
            </Row>
          </Column>
        )}
        {resolvedActions.map((action) => (
          <Button key={action.id} variant={action.variant ?? "filled"} label={action.label} onPress={runThenDismiss(action.onPress)} />
        ))}
      </Column>
    </BottomSheet>
  );
}

export type { ChatUIActions };
