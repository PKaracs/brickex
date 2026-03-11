"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  onPinDrop: (location: { lat: number; lng: number }) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  pinLocation?: { lat: number; lng: number } | null;
}

export function MapboxMap({
  onPinDrop,
  initialCenter = [10, 20],
  initialZoom = 1.2,
  pinLocation,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapInitialized = useRef(false);

  // Store callback in ref to avoid re-running effect
  const onPinDropRef = useRef(onPinDrop);
  onPinDropRef.current = onPinDrop;

  // Create marker element
  const createMarkerElement = () => {
    const el = document.createElement("div");
    el.innerHTML = `<div style="width: 24px; height: 24px; background: white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="width: 8px; height: 8px; background: #171717; border-radius: 50%;"></div>
    </div>`;
    return el;
  };

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("[MapboxMap] Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    mapboxgl.accessToken = token;

    // Track if this effect instance is still mounted
    let isMounted = true;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/peterk22/cmjj38n34002e01sgcplvdvg5",
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      logoPosition: "bottom-left",
    });

    map.current = mapInstance;

    // Minimal attribution
    mapInstance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    // Click to place marker - use ref for callback
    mapInstance.on("click", (e: mapboxgl.MapMouseEvent) => {
      if (!isMounted) return;

      const { lng, lat } = e.lngLat;

      // Remove old marker
      if (marker.current) marker.current.remove();

      // Add new marker
      marker.current = new mapboxgl.Marker({
        element: createMarkerElement(),
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(mapInstance);

      // Call the callback via ref (doesn't cause re-render)
      onPinDropRef.current({ lat, lng });
    });

    // Set cursor when map loads
    mapInstance.on("load", () => {
      if (!isMounted) return;
      mapInstance.getCanvas().style.cursor = "crosshair";
    });

    mapInitialized.current = true;

    return () => {
      isMounted = false;

      // Safely remove the map
      try {
        mapInstance.remove();
      } catch {
        // Ignore errors during cleanup (e.g., AbortError in Strict Mode)
      }

      map.current = null;
      mapInitialized.current = false;
    };
  }, []); // Empty deps - only run once

  // Handle initial pinLocation (from saved state)
  useEffect(() => {
    if (!map.current || !pinLocation) return;

    // Only update if map is loaded and marker doesn't exist yet
    if (!marker.current) {
      marker.current = new mapboxgl.Marker({
        element: createMarkerElement(),
        anchor: "center",
      })
        .setLngLat([pinLocation.lng, pinLocation.lat])
        .addTo(map.current);

      // Fly to the location
      map.current.flyTo({
        center: [pinLocation.lng, pinLocation.lat],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [pinLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Blur overlay for mapbox logo */}
      <div className="absolute bottom-0 left-0 w-28 h-8 backdrop-blur-md bg-black/40 pointer-events-none" />
    </div>
  );
}
