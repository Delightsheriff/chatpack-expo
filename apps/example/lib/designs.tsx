import { Pressable, View } from "react-native";
import {
  ChatIcon,
  createTheme,
  darkTheme,
  lightTheme,
  type ChatComponentOverrides,
  type ChatIcons,
  type ChatLabelOverrides,
  type ChatTheme,
  type SendButtonProps,
} from "chatpack-expo-ui";

/**
 * Four looks built from the same components — nothing here forks a
 * component; each design is only tokens (`createTheme`), slot styles
 * (`theme.components`), labels, icons and component overrides, plus a
 * couple of row-layout switches the demo row reads.
 */
export interface ChatDesign {
  key: string;
  name: string;
  description: string;
  theme: { light: ChatTheme; dark: ChatTheme };
  labels?: ChatLabelOverrides;
  icons?: Partial<ChatIcons>;
  components?: Partial<ChatComponentOverrides>;
  /** Show sender avatars/names next to received messages. */
  showSender: boolean;
  /** Everyone's messages on the left, unframed — Slack/Discord style. */
  flat: boolean;
}

// --- iMessage -------------------------------------------------------------

const iMessageBrand = {
  colors: { bubbleSent: "#0B84FE", bubbleSentForeground: "#FFFFFF", accent: "#0B84FE", receiptRead: "#0B84FE", badge: "#0B84FE" },
  bubble: { radius: 18, groupedRadius: 18, paddingHorizontal: 13, paddingVertical: 7, maxWidth: 0.75 },
  components: {
    // The "tail" corner: only the last bubble of a run gets a tight corner on its own side.
    Bubble: {
      bubble: ({ bubbleAlign, groupedWithNext }: { bubbleAlign: "start" | "end"; groupedWithNext: boolean }) =>
        groupedWithNext ? null : bubbleAlign === "end" ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 },
      text: { fontSize: 17, lineHeight: 22 },
    },
    Composer: {
      root: { borderTopWidth: 0 },
      inputWrapper: { borderRadius: 18, backgroundColor: "transparent" },
    },
  },
} as const;

const iMessage: ChatDesign = {
  key: "imessage",
  name: "iMessage",
  description: "Blue bubbles with a tail corner, no avatars, pill input",
  theme: {
    light: createTheme({ ...iMessageBrand, colors: { ...iMessageBrand.colors, bubbleReceived: "#E9E9EB", bubbleReceivedForeground: "#000000" } }),
    dark: createTheme({ ...iMessageBrand, colors: { ...iMessageBrand.colors, bubbleReceived: "#26252A", bubbleReceivedForeground: "#FFFFFF" } }, darkTheme),
  },
  labels: { composerPlaceholder: "iMessage" },
  icons: { send: { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" } },
  showSender: false,
  flat: false,
};

// --- WhatsApp --------------------------------------------------------------

function WhatsAppSendButton({ onPress, disabled }: SendButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Send"
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#00A884",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ marginLeft: 3 }}>
        <ChatIcon name={disabled ? "mic" : "send"} size={20} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

const whatsAppShape = {
  bubble: { radius: 8, groupedRadius: 8, paddingHorizontal: 9, paddingVertical: 6, maxWidth: 0.82 },
  components: {
    Bubble: {
      bubble: ({ bubbleAlign, groupedWithPrevious }: { bubbleAlign: "start" | "end"; groupedWithPrevious: boolean }) => [
        { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 1, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
        // WhatsApp's tail sits at the *top* of the first message in a run.
        groupedWithPrevious ? null : bubbleAlign === "end" ? { borderTopRightRadius: 0 } : { borderTopLeftRadius: 0 },
      ],
    },
    Composer: {
      root: { borderTopWidth: 0, backgroundColor: "transparent" },
      inputWrapper: { borderRadius: 24, borderWidth: 0, minHeight: 44, alignItems: "center" },
    },
  },
} as const;

const whatsApp: ChatDesign = {
  key: "whatsapp",
  name: "WhatsApp",
  description: "Wallpaper, top-corner tails, round send/mic button",
  theme: {
    light: createTheme({
      ...whatsAppShape,
      colors: {
        background: "#EFEAE2",
        bubbleSent: "#D9FDD3",
        bubbleSentForeground: "#111B21",
        bubbleReceived: "#FFFFFF",
        bubbleReceivedForeground: "#111B21",
        surface: "#FFFFFF",
        accent: "#00A884",
        receiptRead: "#53BDEB",
        badge: "#25D366",
      },
    }),
    dark: createTheme(
      {
        ...whatsAppShape,
        colors: {
          background: "#0B141A",
          bubbleSent: "#005C4B",
          bubbleSentForeground: "#E9EDEF",
          bubbleReceived: "#202C33",
          bubbleReceivedForeground: "#E9EDEF",
          surface: "#202C33",
          accent: "#00A884",
          receiptRead: "#53BDEB",
          badge: "#25D366",
        },
      },
      darkTheme,
    ),
  },
  labels: { composerPlaceholder: "Message" },
  components: { SendButton: WhatsAppSendButton },
  showSender: false,
  flat: false,
};

// --- Flat (Slack-style) ----------------------------------------------------

const flatShape = {
  bubble: { paddingHorizontal: 0, paddingVertical: 0, maxWidth: 1 },
  avatar: { messageSize: 36, radius: 8 },
  components: {
    Bubble: {
      bubble: { backgroundColor: "transparent", borderRadius: 0 },
    },
    MessageContent: { root: { flex: 1 } },
    Message: { root: { paddingVertical: 2 } },
  },
} as const;

const flat: ChatDesign = {
  key: "flat",
  name: "Flat",
  description: "Slack-style: everyone left-aligned, square avatars, names",
  theme: {
    light: createTheme({
      ...flatShape,
      colors: { bubbleSentForeground: lightTheme.colors.foreground, bubbleReceivedForeground: lightTheme.colors.foreground, accent: "#4A154B" },
    }),
    dark: createTheme(
      {
        ...flatShape,
        colors: { bubbleSentForeground: darkTheme.colors.foreground, bubbleReceivedForeground: darkTheme.colors.foreground, accent: "#E0B3E1" },
      },
      darkTheme,
    ),
  },
  labels: { composerPlaceholder: "Message #design" },
  showSender: true,
  flat: true,
};

const defaults: ChatDesign = {
  key: "default",
  name: "Default",
  description: "The package defaults — neutral shadcn-style tokens",
  theme: { light: lightTheme, dark: darkTheme },
  showSender: true,
  flat: false,
};

export const DESIGNS: ChatDesign[] = [defaults, iMessage, whatsApp, flat];

export function findDesign(key: string | undefined): ChatDesign {
  return DESIGNS.find((d) => d.key === key) ?? defaults;
}
