"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MapboxMap } from "@/components/ui/mapbox-map";
import { CitySearch } from "@/components/ui/city-search";
import { toast } from "sonner";
import { Loader2, X, Check } from "lucide-react";
import type {
  TeleportMode,
  TeleportSelection,
  StreetViewData,
} from "@/lib/types/teleport";

// Popular destinations - clean minimal design (image slots ready)
const POPULAR_DESTINATIONS = [
  { city: "Dubai", country: "UAE", emoji: "🏙️" },
  { city: "New York", country: "USA", emoji: "🗽" },
  { city: "Paris", country: "France", emoji: "🗼" },
  { city: "Tokyo", country: "Japan", emoji: "🌸" },
  { city: "Bali", country: "Indonesia", emoji: "🌴" },
  { city: "Maldives", country: "Maldives", emoji: "🏝️" },
  { city: "London", country: "UK", emoji: "🎡" },
  { city: "Miami", country: "USA", emoji: "🌊" },
] as const;

interface SelectTeleportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selection: TeleportSelection | null) => void;
  initialSelection?: TeleportSelection | null;
}

export function SelectTeleportModal({
  open,
  onOpenChange,
  onSave,
  initialSelection,
}: SelectTeleportModalProps) {
  const [mode, setMode] = useState<TeleportMode>(
    initialSelection?.mode || "city"
  );
  const [pinLocation, setPinLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialSelection?.mode === "exact"
      ? { lat: initialSelection.lat, lng: initialSelection.lng }
      : null
  );
  const [streetView, setStreetView] = useState<StreetViewData | null>(
    initialSelection?.mode === "exact" ? initialSelection.sv || null : null
  );
  const [isLoadingSV, setIsLoadingSV] = useState(false);
  const [svError, setSvError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // City mode state
  const [selectedCity, setSelectedCity] = useState<string>(
    initialSelection?.mode === "city" ? initialSelection.city : ""
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialSelection?.mode === "city" ? initialSelection.country || "" : ""
  );

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setHasInteracted(false);
      if (initialSelection) {
        setMode(initialSelection.mode);
        if (initialSelection.mode === "exact") {
          setPinLocation({
            lat: initialSelection.lat,
            lng: initialSelection.lng,
          });
          setStreetView(initialSelection.sv || null);
        } else {
          setSelectedCity(initialSelection.city);
          setSelectedCountry(initialSelection.country || "");
        }
      } else {
        setMode("city");
        setPinLocation(null);
        setStreetView(null);
        setSvError(null);
        setSelectedCity("");
        setSelectedCountry("");
      }
    }
  }, [open, initialSelection]);

  // Auto-fetch Street View when pin is dropped
  const handlePinDrop = async (location: { lat: number; lng: number }) => {
    setPinLocation(location);
    setStreetView(null);
    setSvError(null);
    setIsLoadingSV(true);
    setHasInteracted(true);

    try {
      const res = await fetch("/api/teleport/streetview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: location.lat, lng: location.lng }),
      });

      const data = await res.json();

      if (data.status === "ok") {
        setStreetView({
          imageUrl: data.imageUrl,
          panoLat: data.panoLat,
          panoLng: data.panoLng,
          distanceM: data.distanceM,
          date: data.date,
        });
      } else {
        setSvError("No Street View here");
      }
    } catch (error) {
      console.error("[Teleport] Street View fetch error:", error);
      setSvError("Failed to fetch");
    } finally {
      setIsLoadingSV(false);
    }
  };

  const handleMapInteraction = () => {
    setHasInteracted(true);
  };

  const handleCitySelect = (city: string, country: string) => {
    setSelectedCity(city);
    setSelectedCountry(country);
  };

  const handleSave = () => {
    if (mode === "exact") {
      if (!pinLocation || !streetView) {
        toast.error("Drop a pin to get a Street View photo");
        return;
      }
      onSave({
        mode: "exact",
        lat: pinLocation.lat,
        lng: pinLocation.lng,
        sv: streetView,
      });
    } else {
      if (!selectedCity) {
        toast.error("Select a city");
        return;
      }
      onSave({
        mode: "city",
        city: selectedCity,
        country: selectedCountry || undefined,
      });
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    onSave(null);
    onOpenChange(false);
  };

  const canSave =
    mode === "exact"
      ? pinLocation !== null && streetView !== null
      : selectedCity.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen md:w-[85vw] md:max-w-4xl h-[100dvh] md:h-[85vh] bg-neutral-900 border-neutral-800 p-0 overflow-hidden flex flex-col rounded-none md:rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Select Travel Destination</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition-colors"
        >
          <X className="h-4 w-4 text-neutral-400" />
        </button>

        {/* Mode Toggle */}
        <div className="flex border-b border-neutral-800 flex-shrink-0">
          <button
            onClick={() => setMode("city")}
            className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
              mode === "city"
                ? "text-white border-b-2 border-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            🌍 City Only
          </button>
          <button
            onClick={() => setMode("exact")}
            className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
              mode === "exact"
                ? "text-white border-b-2 border-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            📍 Exact Spot
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {mode === "exact" ? (
            /* EXACT SPOT MODE */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Map - fills available space */}
              <div
                className="relative flex-1"
                onMouseDown={handleMapInteraction}
                onTouchStart={handleMapInteraction}
              >
                <div className="absolute inset-0">
                  <MapboxMap
                    onPinDrop={handlePinDrop}
                    pinLocation={pinLocation}
                    initialZoom={1.2}
                  />
                </div>

                {/* Loading overlay */}
                {isLoadingSV && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                    <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-white animate-spin" />
                  </div>
                )}

                {/* Drop a pin hint */}
                {!pinLocation && !isLoadingSV && !hasInteracted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                      <p className="text-xs md:text-sm text-neutral-300">
                        Drop a pin anywhere
                      </p>
                    </div>
                  </div>
                )}

                {/* Success indicator - bottom left over logo blur */}
                {streetView && !isLoadingSV && (
                  <div className="absolute bottom-2 left-2 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                    <Check className="h-3 w-3 text-white" />
                    <p className="text-[10px] md:text-xs text-white font-medium">
                      Street View found
                    </p>
                  </div>
                )}

                {/* Error indicator - bottom left over logo blur */}
                {svError && !isLoadingSV && (
                  <div className="absolute bottom-2 left-2 bg-red-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
                    <p className="text-[10px] md:text-xs text-white">
                      {svError}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="p-3 md:p-4 flex gap-2 md:gap-3 flex-shrink-0 border-t border-neutral-800">
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="flex-1 h-11 md:h-12 rounded-xl bg-white text-neutral-900 font-medium text-sm hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Use Location
                </button>
                {(initialSelection || pinLocation) && (
                  <button
                    onClick={handleClear}
                    className="px-4 md:px-5 h-11 md:h-12 rounded-xl border border-neutral-700 text-neutral-400 text-sm hover:text-white hover:border-neutral-500 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* CITY ONLY MODE */
            <div className="p-4 md:p-6 space-y-4 md:space-y-5 flex-1 overflow-auto">
              <div className="space-y-1.5 md:space-y-2">
                <p className="text-xs md:text-sm text-neutral-500">
                  Search for a city
                </p>
                <CitySearch
                  onSelect={handleCitySelect}
                  initialValue={
                    selectedCity
                      ? `${selectedCity}${selectedCountry ? `, ${selectedCountry}` : ""}`
                      : ""
                  }
                />
              </div>

              {/* Popular Destinations Grid */}
              <div className="space-y-2.5">
                <p className="text-xs text-neutral-500">Popular destinations</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.city}
                      onClick={() => handleCitySelect(dest.city, dest.country)}
                      className={`group relative rounded-xl p-3 md:p-4 text-left transition-all duration-150 ${
                        selectedCity === dest.city
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50"
                      }`}
                    >
                      <span className="text-2xl md:text-3xl block mb-1.5">
                        {dest.emoji}
                      </span>
                      <h3
                        className={`font-medium text-sm leading-tight ${
                          selectedCity === dest.city
                            ? "text-neutral-900"
                            : "text-white"
                        }`}
                      >
                        {dest.city}
                      </h3>
                      <p
                        className={`text-[10px] md:text-xs ${
                          selectedCity === dest.city
                            ? "text-neutral-600"
                            : "text-neutral-500"
                        }`}
                      >
                        {dest.country}
                      </p>

                      {/* Selected checkmark */}
                      {selectedCity === dest.city && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected city display - only show if selected via search (not cards) */}
              {selectedCity &&
                !POPULAR_DESTINATIONS.find((d) => d.city === selectedCity) && (
                  <div className="p-3 md:p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
                    <div className="flex items-center gap-2.5 md:gap-3">
                      <span className="text-2xl md:text-3xl">🌍</span>
                      <div>
                        <p className="text-sm md:text-base text-white font-medium">
                          {selectedCity}
                        </p>
                        {selectedCountry && (
                          <p className="text-xs md:text-sm text-neutral-500">
                            {selectedCountry}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Action buttons */}
              <div className="flex gap-2 md:gap-3 pt-1 md:pt-2">
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="flex-1 h-11 md:h-12 rounded-xl bg-white text-neutral-900 font-medium text-sm hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Travel Here
                </button>
                {(initialSelection || selectedCity) && (
                  <button
                    onClick={handleClear}
                    className="px-4 md:px-5 h-11 md:h-12 rounded-xl border border-neutral-700 text-neutral-400 text-sm hover:text-white hover:border-neutral-500 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
