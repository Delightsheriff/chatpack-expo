import { Redirect } from "expo-router";

/** `/` opens the Chats tab. */
export default function Index() {
  return <Redirect href="/chats" />;
}
