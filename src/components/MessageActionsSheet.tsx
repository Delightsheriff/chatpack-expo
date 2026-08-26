import { BottomSheet, Column, Row, Button, Text } from "@expo/ui";
import type { ClientMessage } from "@chatpack/client";
import { useChatUI, type ChatUIActions } from "../context/ChatUIProvider";

export const DEFAULT_QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export interface MessageActionsSheetProps {
  message: ClientMessage;
  isPresented: boolean;
  onDismiss: () => void;
  quickReactions?: string[];
}

/**
 * Long-press actions for one message — reply/copy/delete plus a quick
 * reaction row — rendered with `@expo/ui`'s universal `BottomSheet` so it's
 * a real native sheet on iOS and Android (`ui-native-modals`), not a JS
 * modal skinned to look like one.
 *
 * Presence of each action button is driven entirely by which handlers the
 * app wired into `<ChatUIProvider>` (`onReply`, `onCopyMessage`,
 * `onDeleteMessage`, `onReact`) — no separate `showReply`/`showDelete`
 * boolean props to keep in sync with those handlers.
 *
 * This component owns *what's in the sheet*, not *whether it's open* — the
 * caller holds `isPresented` (typically local state toggled by
 * `Bubble`'s `onLongPress`), consistent with `state-lift-state`.
 */
export function MessageActionsSheet({
  message,
  isPresented,
  onDismiss,
  quickReactions = DEFAULT_QUICK_REACTIONS,
}: MessageActionsSheetProps) {
  const { actions } = useChatUI();

  // Every call site below is already inside an `actions.xyz &&` guard, so
  // `fn` here is always a real callback, never `undefined` — kept
  // non-optional so it satisfies Button's required `onPress: () => void`.
  const runThenDismiss = (fn: () => void) => () => {
    fn();
    onDismiss();
  };

  const hasAnyAction = Boolean(actions.onReply || actions.onCopyMessage || actions.onDeleteMessage || actions.onReact);
  if (!hasAnyAction) return null;

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss} snapPoints={["half"]}>
      <Column spacing={12}>
        {actions.onReact && (
          <Column spacing={8}>
            <Text>React</Text>
            <Row spacing={4}>
              {quickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="outlined"
                  label={emoji}
                  onPress={runThenDismiss(() => actions.onReact?.(message.id, emoji))}
                />
              ))}
            </Row>
          </Column>
        )}
        {actions.onReply && <Button label="Reply" onPress={runThenDismiss(() => actions.onReply?.(message.id))} />}
        {actions.onCopyMessage && (
          <Button variant="outlined" label="Copy" onPress={runThenDismiss(() => actions.onCopyMessage?.(message.id))} />
        )}
        {actions.onDeleteMessage && (
          // Universal Button has no destructive/role variant (only
          // filled/outlined/text) — "text" reads as the lowest-emphasis
          // option here, closest to how a destructive action is usually
          // set apart from the primary "Reply" action without a real
          // danger color to lean on.
          <Button variant="text" label="Delete" onPress={runThenDismiss(() => actions.onDeleteMessage?.(message.id))} />
        )}
      </Column>
    </BottomSheet>
  );
}

export type { ChatUIActions };
