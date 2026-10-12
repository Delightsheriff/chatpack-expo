/**
 * Slot styles — the second customization layer (after theme tokens).
 *
 * Every visual component names its inner parts ("slots") and lets you style
 * each one, two ways:
 *
 * - **Per instance:** `styles={{ input: { fontFamily: "Inter" } }}` and
 *   `classNames={{ input: "font-inter" }}` (NativeWind) on the component.
 * - **App-wide:** `theme.components.Composer = { input: { … } }` via
 *   `createTheme`, so every `Composer` in the app gets it without passing
 *   props everywhere.
 *
 * A slot value can also be a function of the component's state — own vs.
 * received bubble, pressed, active tab, receipt status — which is what lets
 * one set of components serve very different designs without forking:
 *
 * ```ts
 * createTheme({
 *   components: {
 *     Bubble: {
 *       bubble: ({ isOwn, groupedWithNext }) => ({
 *         borderBottomRightRadius: isOwn && !groupedWithNext ? 4 : 18,
 *       }),
 *     },
 *   },
 * });
 * ```
 *
 * Resolution order (later wins): component defaults → `theme.components` →
 * instance `styles` → the legacy instance `style` prop (root slot only).
 *
 * This file is the single index of every customization point in the
 * package — if a part of a component isn't listed here, it isn't styleable
 * yet, and that's a bug worth fixing.
 */
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import type { ReceiptStatus } from "../components/ReadReceipt";
import type { BubbleVariant, BubbleAlign } from "../components/message/Bubble";
import type { AttachmentState, AttachmentSize, AttachmentOrientation } from "../components/attachment/context";
import type { MarkerVariant } from "../components/marker/context";

/** One component's slots (name → style type) and the state its slot functions receive. */
export interface SlotDefinition<Slots, State> {
  slots: Slots;
  state: State;
}

interface MessageRowState {
  isOwn: boolean;
  align: "start" | "end";
  groupedWithPrevious: boolean;
  groupedWithNext: boolean;
}

interface AttachmentPartState {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
}

type Empty = Record<string, never>;

/**
 * Every styleable component in the package. Extend with declaration
 * merging if you build your own components on `useSlots`:
 *
 * ```ts
 * declare module "chatpack-expo-ui" {
 *   interface ChatSlotRegistry {
 *     MyBanner: SlotDefinition<{ root: ViewStyle }, { dismissed: boolean }>;
 *   }
 * }
 * ```
 */
export interface ChatSlotRegistry {
  Message: SlotDefinition<{ root: ViewStyle }, MessageRowState>;
  MessageAvatar: SlotDefinition<{ root: ViewStyle }, MessageRowState & { visible: boolean }>;
  MessageContent: SlotDefinition<{ root: ViewStyle }, MessageRowState>;
  MessageHeader: SlotDefinition<{ root: ViewStyle; text: TextStyle }, MessageRowState>;
  MessageFooter: SlotDefinition<{ root: ViewStyle }, MessageRowState>;
  MessageGroup: SlotDefinition<{ root: ViewStyle }, Empty>;
  Bubble: SlotDefinition<
    { container: ViewStyle; bubble: ViewStyle; text: TextStyle },
    MessageRowState & { variant: BubbleVariant; bubbleAlign: BubbleAlign; deleted: boolean; pressed: boolean }
  >;
  BubbleQuote: SlotDefinition<{ root: ViewStyle; sender: TextStyle; excerpt: TextStyle }, { deleted: boolean; pressed: boolean }>;
  BubbleReactions: SlotDefinition<{ root: ViewStyle }, { side: "top" | "bottom"; align: "start" | "end" }>;

  Attachment: SlotDefinition<{ root: ViewStyle }, AttachmentPartState & { pressed: boolean }>;
  AttachmentMedia: SlotDefinition<{ root: ViewStyle }, AttachmentPartState & { variant: "icon" | "image" }>;
  AttachmentContent: SlotDefinition<{ root: ViewStyle }, AttachmentPartState>;
  AttachmentTitle: SlotDefinition<{ text: TextStyle }, AttachmentPartState>;
  AttachmentDescription: SlotDefinition<{ text: TextStyle }, AttachmentPartState>;
  AttachmentActions: SlotDefinition<{ root: ViewStyle }, AttachmentPartState>;
  AttachmentAction: SlotDefinition<{ root: ViewStyle }, AttachmentPartState & { pressed: boolean }>;
  AttachmentGroup: SlotDefinition<{ root: ViewStyle; content: ViewStyle }, Empty>;

  Marker: SlotDefinition<{ root: ViewStyle; line: ViewStyle }, { variant: MarkerVariant }>;
  MarkerContent: SlotDefinition<{ text: TextStyle }, { shimmer: boolean }>;
  MarkerIcon: SlotDefinition<{ root: ViewStyle }, Empty>;

  MessageScroller: SlotDefinition<{ root: ViewStyle; list: ViewStyle }, Empty>;
  MessageScrollerButton: SlotDefinition<
    { root: ViewStyle; label: TextStyle },
    { direction: "start" | "end"; active: boolean; pressed: boolean }
  >;

  Composer: SlotDefinition<
    { root: ViewStyle; inputWrapper: ViewStyle; input: TextStyle; sendButton: ViewStyle },
    { canSend: boolean; pressed: boolean }
  >;
  ChatKeyboardView: SlotDefinition<{ root: ViewStyle }, Empty>;
  TypingIndicator: SlotDefinition<{ root: ViewStyle; dot: ViewStyle }, Empty>;
  ReadReceipt: SlotDefinition<{ root: ViewStyle; text: TextStyle }, { status: ReceiptStatus; variant: "icon" | "text" }>;
  SwipeToReply: SlotDefinition<{ root: ViewStyle; icon: ViewStyle }, { direction: "start" | "end" }>;
  QuickReactionBar: SlotDefinition<{ root: ViewStyle; item: ViewStyle; emoji: TextStyle }, { pressed: boolean }>;
  MessageActionsSheet: SlotDefinition<
    {
      backdrop: ViewStyle;
      sheet: ViewStyle;
      sectionTitle: TextStyle;
      reactionsRow: ViewStyle;
      reactionButton: ViewStyle;
      reactionEmoji: TextStyle;
      actions: ViewStyle;
      actionButton: ViewStyle;
      actionText: TextStyle;
      cancelButton: ViewStyle;
      cancelText: TextStyle;
    },
    { pressed: boolean; destructive: boolean }
  >;
  Avatar: SlotDefinition<{ root: ViewStyle; image: ImageStyle; initials: TextStyle }, { hasImage: boolean; size: number }>;

  ConversationList: SlotDefinition<{ root: ViewStyle }, Empty>;
  ConversationListItem: SlotDefinition<
    {
      root: ViewStyle;
      body: ViewStyle;
      titleRow: ViewStyle;
      title: TextStyle;
      preview: TextStyle;
      trailing: ViewStyle;
      timestamp: TextStyle;
      badge: ViewStyle;
      badgeText: TextStyle;
    },
    { hasUnread: boolean; pressed: boolean }
  >;
  ConversationSearchBar: SlotDefinition<{ root: ViewStyle; input: TextStyle }, { focused: boolean; hasValue: boolean }>;
  ConversationFilterTabs: SlotDefinition<{ root: ViewStyle; tab: ViewStyle; tabText: TextStyle }, { active: boolean; pressed: boolean }>;
  ConversationStoryRow: SlotDefinition<
    { root: ViewStyle; content: ViewStyle; item: ViewStyle; name: TextStyle; addCircle: ViewStyle; addLabel: TextStyle },
    { pressed: boolean }
  >;

  ScrollFade: SlotDefinition<{ root: ViewStyle; fade: ViewStyle }, { edge: "start" | "end" }>;
}

export type ChatComponentName = keyof ChatSlotRegistry;
export type SlotsOf<C extends ChatComponentName> = ChatSlotRegistry[C]["slots"];
export type SlotStateOf<C extends ChatComponentName> = ChatSlotRegistry[C]["state"];

/** A slot's value: a style, or a function of the component's state returning one. */
export type SlotStyle<Style, State> = StyleProp<Style> | ((state: State) => StyleProp<Style>);

/** The `styles` prop / `theme.components[Name]` shape for one component. */
export type SlotStyles<C extends ChatComponentName> = {
  [K in keyof SlotsOf<C>]?: SlotStyle<SlotsOf<C>[K], SlotStateOf<C>>;
};

/** The `classNames` prop shape for one component (NativeWind / any `className`-aware styling). */
export type SlotClassNames<C extends ChatComponentName> = {
  [K in keyof SlotsOf<C>]?: string;
};

/** App-wide slot overrides, set on `theme.components`. */
export type ChatComponentStyles = {
  [C in ChatComponentName]?: SlotStyles<C>;
};

/** Props every slot-aware component accepts. */
export interface SlotProps<C extends ChatComponentName> {
  /** Per-slot style overrides, each a style or `(state) => style`. Merged after `theme.components`. */
  styles?: SlotStyles<C> | undefined;
  /** Per-slot `className`s, for NativeWind or any `className`-aware styling system. */
  classNames?: SlotClassNames<C> | undefined;
}
