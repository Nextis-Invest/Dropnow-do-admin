"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";

// Define the MapBox API access token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Define the types for MapBox API responses
interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  text: string;
  place_type: string[];
  properties: Record<string, any>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

// Define the props for the AddressAutocomplete component
interface AddressAutocompleteProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  country?: string; // Optional country restriction (e.g., 'fr' for France)
}

// Define the AddressAutocomplete component
export function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  className,
  placeholder = "Enter an address",
  country = "fr", // Default to France
  ...props
}: AddressAutocompleteProps) {
  // State for the input value, suggestions, loading state, and selected address
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a debounced function for fetching suggestions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useRef(
    debounce((input: string) => {
      if (input.length < 3) {
        setIsLoading(false);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      fetchSuggestions(input);
    }, 300)
  ).current;

  // Handle input change to fetch suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Show suggestions if there's input value
    if (value.length > 0) {
      setIsLoading(true);
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch suggestions from the MapBox Geocoding API
  const fetchSuggestions = async (input: string) => {
    try {
      // Construct the API URL with the input and country restriction
      const countryRestriction = country ? `&country=${country}` : "";
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        input
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}${countryRestriction}&types=address,place,locality,neighborhood,postcode&limit=5`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`MapBox API error: ${response.statusText}`);
      }

      const data: MapboxResponse = await response.json();

      setIsLoading(false);
      setSuggestions(data.features);
      setShowSuggestions(data.features.length > 0);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (feature: MapboxFeature) => {
    setInputValue(feature.place_name);
    setSuggestions([]);
    setShowSuggestions(false);

    // Extract coordinates (MapBox returns [longitude, latitude])
    const lng = feature.center[0];
    const lat = feature.center[1];

    // Call the onAddressSelect callback with the selected address and coordinates
    onAddressSelect(feature.place_name, lat, lng);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() =>
            inputValue.length >= 3 &&
            suggestions.length > 0 &&
            setShowSuggestions(true)
          }
          placeholder={placeholder}
          className={cn(className)}
          {...props}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ul className="divide-y divide-gray-100">
            {suggestions.map((feature) => (
              <li
                key={feature.id}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleSuggestionSelect(feature)}
              >
                {feature.place_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
