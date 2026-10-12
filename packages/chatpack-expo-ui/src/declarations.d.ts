declare module "expo-linear-gradient" {
  import React from "react";
  import type { ViewProps } from "react-native";
  export interface LinearGradientProps extends ViewProps {
    colors: readonly (string | number)[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: readonly number[];
  }
  export const LinearGradient: React.ComponentType<LinearGradientProps>;
}

declare module "expo-image" {
  import React from "react";
  import type { ImageProps } from "react-native";
  export interface ExpoImageProps extends ImageProps {
    source?: any;
    placeholder?: any;
    contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    transition?: number | { duration?: number };
  }
  export const Image: React.ComponentType<ExpoImageProps>;
}

declare module "react-native-reanimated" {
  export const FadeIn: any;
  export const FadeOut: any;
  export const Layout: any;
  export const SlideInDown: any;
  export const SlideOutDown: any;
  export function useSharedValue<T>(init: T): { value: T };
  export function useAnimatedStyle(fn: () => any): any;
  export function withSpring(val: any, config?: any): any;
  export function withTiming(val: any, config?: any): any;
  export function withDelay(delay: number, animation: any): any;
  export function withRepeat(animation: any, numberOfReps?: number, reverse?: boolean): any;
  export function withSequence(...animations: any[]): any;
  export const Easing: any;
  export function runOnJS(fn: any): any;
  const Animated: any;
  export default Animated;
}

declare module "react-native-gesture-handler" {
  export const Swipeable: any;
  export const RectButton: any;
  export const GestureHandlerRootView: any;
  export const PanGestureHandler: any;
  export const State: any;
  export const Gesture: {
    Pan: () => {
      activeOffsetX: (...args: any[]) => any;
      onUpdate: (cb: (event: any) => void) => any;
      onEnd: (...args: any[]) => any;
    };
  };
  export const GestureDetector: any;
}

declare module "@shopify/flash-list" {
  import React from "react";
  import type { ScrollViewProps } from "react-native";
  export interface ListRenderItemInfo<T> {
    item: T;
    index: number;
    target?: string;
  }
  export type ViewToken<T = any> = any;
  export type FlashListRef<T> = FlashList<T>;
  export class FlashList<T> extends React.Component<any> {
    scrollToIndex(params: any): void;
    scrollToOffset(params: any): void;
    scrollToEnd(params?: any): void;
    scrollToTop(params?: any): void;
  }
}

declare module "@expo/vector-icons" {
  import React from "react";
  import type { TextProps } from "react-native";
  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export const Ionicons: React.ComponentType<IconProps>;
  export const MaterialIcons: React.ComponentType<IconProps>;
}
