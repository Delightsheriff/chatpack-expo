import { useChatUI } from "../context/ChatUIProvider";
import { createSlotResolver, type SlotResolver } from "./resolveSlots";
import type { ChatComponentName, SlotProps, SlotStateOf } from "./slots";

/**
 * Resolves `theme.components[component]` and the instance's `styles` /
 * `classNames` for a slot-aware component. See `slots.ts` for the model.
 */
export function useSlots<C extends ChatComponentName>(
  component: C,
  props: SlotProps<C>,
  state: SlotStateOf<C>,
): SlotResolver<C> {
  const { state: ui } = useChatUI();
  return createSlotResolver(component, ui.theme, props, state);
}
