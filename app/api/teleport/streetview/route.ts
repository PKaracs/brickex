import { NextRequest, NextResponse } from "next/server";
import { validateInput, streetViewRequestSchema } from "@/lib/validation";

const MAX_RADIUS = 500; // meters

interface MetadataResponse {
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "NOT_FOUND"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED";
  location?: { lat: number; lng: number };
  pano_id?: string;
  date?: string;
}

// Haversine formula to calculate distance between two points
function getDistanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validated = validateInput(streetViewRequestSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { lat, lng, heading, pitch = -5, fov = 90 } = validated.data;

    // Check if key exists (try both naming conventions)
    const keyFromEnv =
      process.env.GOOGLE_STREETVIEW_KEY || process.env.GOOGLE_STREET_VIEW_KEY;
    if (!keyFromEnv) {
      console.error(
        "[StreetView API] Missing GOOGLE_STREETVIEW_KEY or GOOGLE_STREET_VIEW_KEY"
      );
      console.error(
        "[StreetView API] Available env vars:",
        Object.keys(process.env).filter(
          (k) => k.includes("GOOGLE") || k.includes("STREET")
        )
      );
      return NextResponse.json(
        {
          error: "API not configured",
          debug: "GOOGLE_STREETVIEW_KEY not found in environment variables",
        },
        { status: 500 }
      );
    }

    // Use the key from env directly
    const GOOGLE_SV_KEY = keyFromEnv;

    // Step 1: Check metadata to find nearest panorama
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=${MAX_RADIUS}&key=${GOOGLE_SV_KEY}`;
    const metaRes = await fetch(metadataUrl);
    const meta: MetadataResponse = await metaRes.json();

    if (meta.status !== "OK" || !meta.location) {
      return NextResponse.json(
        {
          status: "no_coverage",
          message: "No Street View coverage within 500m of this location",
          suggestion: "Try a nearby road or switch to City mode",
        },
        { status: 404 }
      );
    }

    // Step 2: Calculate distance from requested point to actual panorama
    const distanceM = getDistanceM(
      lat,
      lng,
      meta.location.lat,
      meta.location.lng
    );

    // Step 3: Build the Street View image URL
    const imageParams = new URLSearchParams({
      size: "640x640",
      location: `${meta.location.lat},${meta.location.lng}`,
      pitch: String(pitch),
      fov: String(fov),
      key: GOOGLE_SV_KEY,
    });

    // Add heading if provided, otherwise Google will auto-orient
    if (heading !== undefined) {
      imageParams.set("heading", String(heading));
    }

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?${imageParams.toString()}`;

    return NextResponse.json({
      status: "ok",
      imageUrl,
      panoLat: meta.location.lat,
      panoLng: meta.location.lng,
      distanceM,
      date: meta.date, // When the panorama was captured
    });
  } catch (error) {
    console.error("[StreetView API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
