"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CitySearchProps {
  onSelect: (city: string, country: string) => void;
  initialValue?: string;
}

interface GeocodingFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
}

export function CitySearch({ onSelect, initialValue = "" }: CitySearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search using Mapbox Geocoding API
  const handleSearch = async (q: string) => {
    setQuery(q);
    setHighlightedIndex(-1);

    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          console.error("[CitySearch] Missing NEXT_PUBLIC_MAPBOX_TOKEN");
          return;
        }

        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?types=place&limit=5&access_token=${token}`
        );
        const data = await res.json();
        setResults(data.features || []);
        setOpen(true);
      } catch (error) {
        console.error("[CitySearch] Error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = (result: GeocodingFeature) => {
    const city = result.text;
    const country =
      result.context?.find((c) => c.id.startsWith("country"))?.text || "";
    setQuery(`${city}${country ? `, ${country}` : ""}`);
    onSelect(city, country);
    setOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="py-4 text-center text-sm text-neutral-500">
              {isLoading ? "Searching..." : "No cities found"}
            </div>
          ) : (
            <ul className="py-1 max-h-60 overflow-auto">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "px-3 py-2 cursor-pointer text-sm text-neutral-300 transition-colors",
                    highlightedIndex === index
                      ? "bg-neutral-800 text-white"
                      : "hover:bg-neutral-800/50"
                  )}
                >
                  {result.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
