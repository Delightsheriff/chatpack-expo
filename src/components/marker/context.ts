import { createContext, useContext } from "react";

export type MarkerVariant = "default" | "border" | "separator";

export interface MarkerContextValue {
  variant: MarkerVariant;
}

export const MarkerContext = createContext<MarkerContextValue | null>(null);

export function useMarkerContext(): MarkerContextValue {
  const ctx = useContext(MarkerContext);
  if (!ctx) {
    throw new Error("MarkerIcon/MarkerContent must be used inside a <Marker> root.");
  }
  return ctx;
}
