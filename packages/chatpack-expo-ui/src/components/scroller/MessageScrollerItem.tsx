import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { classNameProps } from "../../utils/classNameProps";

export interface MessageScrollerItemProps {
  messageId: string;
  /**
   * Matches shadcn's per-item API shape (`scrollAnchor={message.role === "user"}`).
   *
   * PLATFORM DIFFERENCE, read before relying on this: on the web, this
   * prop drives the scroll engine directly because `MessageScrollerItem`
   * registers itself into the provider via a DOM-mount effect — safe there
   * since each row is a persistent DOM node. FlashList recycles component
   * instances across different data items, so a mount-based registry here
   * would silently go stale as rows scroll in and out. This RN port's
   * scroll engine instead derives anchors once from
   * `MessageScrollerProvider`'s `isTurnAnchor` predicate evaluated over
   * the full `messages` array — this prop is purely presentational (it
   * currently just adds a touch of extra top spacing, overridable via
   * `style`).
   *
   * Pass `isAnchor` straight through — `MessageScroller` already evaluated
   * `isTurnAnchor` for this row and handed it to your `ItemComponent` via
   * `MessageItemProps.isAnchor`:
   *
   * ```tsx
   * function Row({ message, isAnchor }: MessageItemProps) {
   *   return <MessageScrollerItem messageId={message.id} scrollAnchor={isAnchor}>...
   * ```
   *
   * Don't call your own turn-anchor predicate again here — that would be
   * the same fact computed twice, with nothing keeping the two copies in
   * sync if the predicate ever changes.
   */
  scrollAnchor?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * The transcript row boundary — corresponds to shadcn's
 * `MessageScrollerItem`. A thin, purely presentational wrapper in this
 * port (see the `scrollAnchor` doc above for why); wrap every item your
 * `ItemComponent` renders in one so a future measurement/registration
 * feature has a stable place to hook into without an API change.
 */
export function MessageScrollerItem({ messageId, scrollAnchor, children, style, className }: MessageScrollerItemProps) {
  return (
    <View
      testID={`message-scroller-item-${messageId}`}
      style={[scrollAnchor && styles.anchorSpacing, style]}
      {...classNameProps(className)}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  anchorSpacing: {
    paddingTop: 4,
  },
});
