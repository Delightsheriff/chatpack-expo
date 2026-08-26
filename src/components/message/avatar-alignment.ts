import { createContext, useContext } from "react";

/**
 * Bridges `MessageContent`'s `MessageFooter` (if any) to the sibling
 * `MessageAvatar`, so the avatar can offset itself by the footer's real
 * measured height and stay aligned with the bubble instead of the
 * footer — matching shadcn's "avatar anchors to the message surface, not
 * the footer" behavior. Real `onLayout` measurement rather than a guessed
 * constant, since footer content (a timestamp vs. an actions row) varies
 * in height per app.
 */
export interface MessageAvatarAlignmentContextValue {
  footerHeight: number;
  reportFooterHeight: (height: number) => void;
}

export const MessageAvatarAlignmentContext = createContext<MessageAvatarAlignmentContextValue | null>(null);

export function useMessageAvatarAlignment(): MessageAvatarAlignmentContextValue {
  const ctx = useContext(MessageAvatarAlignmentContext);
  if (!ctx) {
    throw new Error("MessageAvatar/MessageFooter must be used inside a <Message> root.");
  }
  return ctx;
}
