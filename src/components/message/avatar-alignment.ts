import { createRequiredContext } from "../../utils/createRequiredContext";

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

export const [MessageAvatarAlignmentContext, useMessageAvatarAlignment] =
  createRequiredContext<MessageAvatarAlignmentContextValue>("Message");
