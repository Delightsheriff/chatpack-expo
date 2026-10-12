import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useConversations } from "chatpack-expo/react";
import { useChatSession } from "../../lib/session";

/** Native tab bar (UITabBar / Material bottom navigation) — Liquid Glass on iOS 26. */
export default function TabsLayout() {
  const { chat } = useChatSession();
  const { data } = useConversations(chat);
  const unread = (data?.conversations ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Icon sf={{ default: "bubble.left.and.bubble.right", selected: "bubble.left.and.bubble.right.fill" }} md="chat" />
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        {unread > 0 && <NativeTabs.Trigger.Badge>{unread > 99 ? "99+" : String(unread)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="designs">
        <NativeTabs.Trigger.Icon sf={{ default: "paintpalette", selected: "paintpalette.fill" }} md="palette" />
        <NativeTabs.Trigger.Label>Designs</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
