export type TeleportMode = "exact" | "city";

export interface StreetViewData {
  imageUrl: string;
  panoLat: number;
  panoLng: number;
  distanceM: number;
  date?: string;
}

export type TeleportSelection =
  | { mode: "exact"; lat: number; lng: number; placeLabel?: string; sv?: StreetViewData }
  | { mode: "city"; city: string; country?: string };
