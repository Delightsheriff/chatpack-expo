import { Marker as MarkerRoot } from "./Marker";
import { MarkerIcon } from "./MarkerIcon";
import { MarkerContent } from "./MarkerContent";

/**
 * `<Marker>` as a compound namespace:
 *
 * ```tsx
 * <Marker variant="separator"><Marker.Content>Today</Marker.Content></Marker>
 *
 * <Marker role="status">
 *   <Marker.Icon><Spinner /></Marker.Icon>
 *   <Marker.Content shimmer>Thinking…</Marker.Content>
 * </Marker>
 * ```
 */
export const Marker = Object.assign(MarkerRoot, { Icon: MarkerIcon, Content: MarkerContent });

export { MarkerIcon } from "./MarkerIcon";
export type { MarkerIconProps } from "./MarkerIcon";
export { MarkerContent } from "./MarkerContent";
export type { MarkerContentProps } from "./MarkerContent";
export type { MarkerProps } from "./Marker";
export type { MarkerVariant } from "./context";
