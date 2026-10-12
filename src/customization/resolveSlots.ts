import type { StyleProp, TextStyle } from "react-native";
import type { ChatTheme } from "../theme/tokens";
import { classNameProps } from "../utils/classNameProps";
import type { ChatComponentName, SlotProps, SlotStateOf, SlotStyle, SlotStyles, SlotsOf } from "./slots";

function resolve<Style, State>(value: SlotStyle<Style, State> | undefined, state: State): StyleProp<Style> {
  if (value === undefined) return undefined;
  return typeof value === "function" ? (value as (state: State) => StyleProp<Style>)(state) : value;
}

export interface SlotResolver<C extends ChatComponentName> {
  /**
   * Theme + instance overrides for one slot, as a style array to append
   * after the component's own defaults. Pass `state` to override part of
   * the component state for item-level slots (a pressed tab, an active
   * action).
   */
  style<K extends keyof SlotsOf<C>>(slot: K, state?: Partial<SlotStateOf<C>>): StyleProp<SlotsOf<C>[K]>;
  /** `{ className }` for one slot, ready to spread onto the element. */
  className(slot: keyof SlotsOf<C>, fallback?: string): { className?: string };
}

/** Non-hook core of `useSlots`, for code that already has the theme. */
export function createSlotResolver<C extends ChatComponentName>(
  component: C,
  theme: ChatTheme,
  props: SlotProps<C>,
  state: SlotStateOf<C>,
): SlotResolver<C> {
  const themeSlots = theme.components[component] as SlotStyles<C> | undefined;
  const instanceSlots = props.styles;
  return {
    style<K extends keyof SlotsOf<C>>(slot: K, partial?: Partial<SlotStateOf<C>>): StyleProp<SlotsOf<C>[K]> {
      type Value = SlotStyle<SlotsOf<C>[K], SlotStateOf<C>> | undefined;
      const resolvedState = partial ? { ...state, ...partial } : state;
      const fromTheme = resolve(themeSlots?.[slot] as Value, resolvedState);
      const fromInstance = resolve(instanceSlots?.[slot] as Value, resolvedState);
      if (fromTheme === undefined) return fromInstance;
      if (fromInstance === undefined) return fromTheme;
      return [fromTheme, fromInstance];
    },
    className(slot, fallback) {
      return classNameProps(props.classNames?.[slot] ?? fallback);
    },
  };
}

export type FontWeightName = "regular" | "medium" | "semibold" | "bold";

const NUMERIC_WEIGHT: Record<FontWeightName, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

/**
 * `fontFamily` + `fontWeight` for a weight, honoring `theme.fonts`. With a
 * custom family for that weight, `fontWeight` is left unset (Android
 * ignores it for custom fonts and iOS would synthesize a fake bold).
 */
export function fontStyle(theme: ChatTheme, weight: FontWeightName = "regular"): TextStyle {
  const family = theme.fonts[weight];
  if (family) return { fontFamily: family };
  const regular = theme.fonts.regular;
  return regular ? { fontFamily: regular, fontWeight: NUMERIC_WEIGHT[weight] } : { fontWeight: NUMERIC_WEIGHT[weight] };
}
