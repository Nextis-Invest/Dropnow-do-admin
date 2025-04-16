// src/components/ride-form-steps/RideDetailsStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { CarIcon, Loader2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "../form-helpers/DateTimePicker";
import type { StepProps } from "../types";
import {
  RIDE_CATEGORIES,
  RIDE_STATUSES,
  AIRPORT_TRANSFER_SUBTYPES,
} from "../constants";
import {
  getRideCategoryLabel,
  getAirportTransferSubtypeLabel,
} from "../types/rideFormUtils";
import { StepHeader } from "../form-helpers/StepHeader";
import { FlightTicket, FlightData } from "../form-helpers/FlightTicket";
import { getFlightData } from "@/lib/services/aviation-service";

interface RideDetailsStepProps extends StepProps {
  isMission: boolean;
}

export const RideDetailsStep: React.FC<RideDetailsStepProps> = ({
  form,
  isMission,
}) => {
  // Get the selected ride type and subtype
  const selectedRideType = form.watch("category");
  const selectedAirportSubtype = form.watch("airportTransferSubtype");
  const flightNumberValue = form.watch("flightNumber");

  // State for flight data fetching
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedFlightNumber, setLastFetchedFlightNumber] =
    useState<string>("");

  // Function to fetch flight data
  const fetchFlightData = async (flightNumber: string) => {
    if (!flightNumber || isLoading || flightNumber === lastFetchedFlightNumber)
      return;

    // Format flight number (remove spaces, convert to uppercase)
    const formattedFlightNumber = flightNumber.trim().toUpperCase();
    if (formattedFlightNumber !== flightNumber) {
      form.setValue("flightNumber", formattedFlightNumber);
    }

    setIsLoading(true);
    setError(null);
    setFlightData(null);

    try {
      const data = await getFlightData(formattedFlightNumber);
      if (data) {
        setFlightData(data);
        setLastFetchedFlightNumber(formattedFlightNumber);
      } else {
        setError(
          `No flight information found for ${formattedFlightNumber}. Please check the flight number and try again.`
        );
      }
    } catch (err) {
      console.error("Flight data fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch flight data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch flight data when flight number matches the pattern (2 letters followed by numbers)
  useEffect(() => {
    if (
      selectedRideType === "AIRPORT_TRANSFER" &&
      selectedAirportSubtype &&
      flightNumberValue
    ) {
      // Check if the flight number matches the pattern: 2 letters followed by numbers
      const flightNumberPattern = /^[A-Za-z]{2}\d+$/;
      if (flightNumberPattern.test(flightNumberValue.trim())) {
        // Only fetch if it's a new flight number
        if (
          flightNumberValue.trim().toUpperCase() !== lastFetchedFlightNumber
        ) {
          // Add a debounce to prevent too many API calls while typing
          const debounceTimer = setTimeout(() => {
            fetchFlightData(flightNumberValue);
          }, 800); // Wait 800ms after the user stops typing

          return () => clearTimeout(debounceTimer);
        }
      }
    }
  }, [
    selectedRideType,
    selectedAirportSubtype,
    flightNumberValue,
    lastFetchedFlightNumber,
  ]);

  // Calculate pickup time based on flight schedule
  const calculatePickupTime = (
    flightTime: string,
    isArrival: boolean
  ): Date => {
    const flightDateTime = new Date(flightTime);

    if (isArrival) {
      // For airport pickup: Set pickup time to flight arrival time
      return flightDateTime;
    } else {
      // For airport dropoff: Set pickup time to 3 hours before flight departure
      const pickupTime = new Date(flightDateTime);
      pickupTime.setHours(pickupTime.getHours() - 3);
      return pickupTime;
    }
  };

  // Store flight data in form context for use in other steps
  useEffect(() => {
    if (flightData) {
      console.log("Flight data received:", JSON.stringify(flightData, null, 2));

      // Store the flight data in the form context
      form.setValue("flightData", flightData, {
        shouldValidate: false,
        shouldDirty: false,
      });

      // Helper function to format location with terminal and gate
      const formatLocationWithDetails = (
        airport?: string,
        terminal?: string,
        gate?: string
      ): string => {
        let formattedLocation = airport || "";

        // Add terminal information if available
        if (terminal) {
          formattedLocation += ` - Terminal ${terminal}`;
        }

        // Add gate information if available
        if (gate) {
          formattedLocation += ` - Gate ${gate}`;
        }

        return formattedLocation;
      };

      // Set pickup and dropoff locations based on airport transfer type
      if (selectedAirportSubtype === "AIRPORT_PICKUP") {
        // For airport pickup: pickup is arrival airport, dropoff is destination
        if (flightData.arrival?.airport) {
          // Format pickup address with terminal and gate information
          const pickupAddress = formatLocationWithDetails(
            flightData.arrival.airport,
            flightData.arrival.terminal,
            flightData.arrival.gate
          );

          form.setValue("pickupAddress", pickupAddress, {
            shouldValidate: true,
          });
          console.log(`Setting pickup address to: ${pickupAddress}`);

          // Set pickup time to flight arrival time
          if (flightData.arrival?.scheduled) {
            const pickupTime = calculatePickupTime(
              flightData.arrival.scheduled,
              true
            );
            form.setValue("pickupTime", pickupTime, {
              shouldValidate: true,
            });
            console.log(
              `Setting pickup time to arrival time: ${pickupTime.toISOString()}`
            );
          }
        }
      } else if (selectedAirportSubtype === "AIRPORT_DROPOFF") {
        // For airport dropoff: pickup is source, dropoff is departure airport
        if (flightData.departure?.airport) {
          // Format dropoff address with terminal and gate information
          const dropoffAddress = formatLocationWithDetails(
            flightData.departure.airport,
            flightData.departure.terminal,
            flightData.departure.gate
          );

          form.setValue("dropoffAddress", dropoffAddress, {
            shouldValidate: true,
          });
          console.log(`Setting dropoff address to: ${dropoffAddress}`);

          // Set pickup time to 3 hours before flight departure
          if (flightData.departure?.scheduled) {
            const pickupTime = calculatePickupTime(
              flightData.departure.scheduled,
              false
            );
            form.setValue("pickupTime", pickupTime, {
              shouldValidate: true,
            });
            console.log(
              `Setting pickup time to 3 hours before departure: ${pickupTime.toISOString()}`
            );
          }
        }
      }
    }
  }, [flightData, selectedAirportSubtype, form]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Ride Type"
        description="Select the type of ride you want to create"
        icon={<CarIcon className="h-5 w-5" />}
      />

      {/* Ride Type Selection */}
      {!isMission && (
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ride Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ride type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RIDE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getRideCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Airport Transfer Subtype Selection */}
      {selectedRideType === "AIRPORT_TRANSFER" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="airportTransferSubtype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Airport Transfer Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select airport transfer type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AIRPORT_TRANSFER_SUBTYPES.map((subtype) => (
                      <SelectItem key={subtype} value={subtype}>
                        {getAirportTransferSubtypeLabel(subtype)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Flight Number Field */}
          {selectedAirportSubtype && (
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedAirportSubtype === "AIRPORT_PICKUP"
                      ? "Arrival Flight Number"
                      : "Departure Flight Number"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g. BA123"
                        {...field}
                        className={isLoading ? "pr-10" : ""}
                      />
                      {isLoading && (
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedAirportSubtype === "AIRPORT_PICKUP"
                      ? "Enter the flight number for tracking arrival"
                      : "Enter the flight number for tracking departure"}{" "}
                    <span className="italic">
                      Flight data will be fetched automatically as you type a
                      valid flight number format (e.g., BA123).
                    </span>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Flight Ticket */}
          {flightData && (
            <FlightTicket
              flightData={flightData}
              onClose={() => setFlightData(null)}
              airportTransferSubtype={selectedAirportSubtype}
            />
          )}
        </div>
      )}

      {/* Display selected ride type details */}
      {selectedRideType && (
        <div className="p-4 border rounded-md bg-muted/50">
          <h4 className="font-medium mb-2">Selected Ride Type</h4>
          <p className="text-sm">{getRideCategoryLabel(selectedRideType)}</p>
          {selectedRideType === "AIRPORT_TRANSFER" &&
            selectedAirportSubtype && (
              <>
                <p className="text-sm font-medium mt-1">
                  Subtype:{" "}
                  {getAirportTransferSubtypeLabel(selectedAirportSubtype)}
                </p>
                {form.watch("flightNumber") && (
                  <p className="text-sm font-medium mt-1">
                    {selectedAirportSubtype === "AIRPORT_PICKUP"
                      ? "Arrival"
                      : "Departure"}{" "}
                    Flight: {form.watch("flightNumber")}
                  </p>
                )}
              </>
            )}
          <p className="text-sm text-muted-foreground mt-1">
            {selectedRideType === "AIRPORT_TRANSFER" &&
              "For transportation to and from airports"}
            {selectedRideType === "TRAIN_STATION_TRANSFER" &&
              "For transportation to and from train stations"}
            {selectedRideType === "CITY_TRANSFER" &&
              "For transportation within or between cities"}
            {selectedRideType === "BOOK_BY_HOUR" &&
              "For booking a chauffeur by the hour"}
          </p>
        </div>
      )}

      {/* Additional ride details will be moved to a separate step */}
    </div>
  );
};
