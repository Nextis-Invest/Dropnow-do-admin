"use client";

import React, { useEffect } from "react";
import { MapPinIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { StepHeader } from "../form-helpers/StepHeader";
import { RIDE_STATUSES } from "../constants";

export const LocationDetailsStep: React.FC<StepProps> = ({ form }) => {
  const rideType = form.watch("category");
  const airportTransferSubtype = form.watch("airportTransferSubtype");
  const flightData = form.watch("flightData");

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

  // Update pickup and dropoff locations based on flight data
  useEffect(() => {
    if (
      rideType === "AIRPORT_TRANSFER" &&
      airportTransferSubtype &&
      flightData
    ) {
      if (airportTransferSubtype === "AIRPORT_PICKUP") {
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
        }
      } else if (airportTransferSubtype === "AIRPORT_DROPOFF") {
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
        }
      }
    }
  }, [rideType, airportTransferSubtype, flightData, form]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Location Details"
        description="Enter pickup and dropoff information"
        icon={<MapPinIcon className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="pickupAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {rideType === "AIRPORT_TRANSFER" &&
                airportTransferSubtype === "AIRPORT_PICKUP"
                  ? "Airport Pickup Location"
                  : rideType === "AIRPORT_TRANSFER" &&
                    airportTransferSubtype === "AIRPORT_DROPOFF"
                  ? "Pickup Location"
                  : "Pickup Address"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder={
                      rideType === "AIRPORT_TRANSFER" &&
                      airportTransferSubtype === "AIRPORT_PICKUP"
                        ? "Airport Terminal/Gate"
                        : "Pickup Address"
                    }
                    {...field}
                    className={
                      flightData && airportTransferSubtype === "AIRPORT_PICKUP"
                        ? "border-green-500 pr-10"
                        : ""
                    }
                  />
                  {flightData &&
                    airportTransferSubtype === "AIRPORT_PICKUP" && (
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    )}
                </div>
              </FormControl>
              {rideType === "AIRPORT_TRANSFER" &&
                airportTransferSubtype === "AIRPORT_PICKUP" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {flightData ? (
                      <span className="text-green-600">
                        ✓ Automatically set to arrival airport with terminal and
                        gate information (if available). You can edit if needed.
                      </span>
                    ) : (
                      "Enter the airport terminal, gate, or meeting point"
                    )}
                  </p>
                )}
              <FormMessage />
            </FormItem>
          )}
        />

        {rideType !== "BOOK_BY_HOUR" && (
          <FormField
            control={form.control}
            name="dropoffAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {rideType === "AIRPORT_TRANSFER" &&
                  airportTransferSubtype === "AIRPORT_PICKUP"
                    ? "Destination Address"
                    : rideType === "AIRPORT_TRANSFER" &&
                      airportTransferSubtype === "AIRPORT_DROPOFF"
                    ? "Airport Dropoff Location"
                    : "Dropoff Address"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={
                        rideType === "AIRPORT_TRANSFER" &&
                        airportTransferSubtype === "AIRPORT_DROPOFF"
                          ? "Airport Terminal/Gate"
                          : "Dropoff Address"
                      }
                      {...field}
                      className={
                        flightData &&
                        airportTransferSubtype === "AIRPORT_DROPOFF"
                          ? "border-green-500 pr-10"
                          : ""
                      }
                    />
                    {flightData &&
                      airportTransferSubtype === "AIRPORT_DROPOFF" && (
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      )}
                  </div>
                </FormControl>
                {rideType === "AIRPORT_TRANSFER" &&
                  airportTransferSubtype === "AIRPORT_DROPOFF" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {flightData ? (
                        <span className="text-green-600">
                          ✓ Automatically set to departure airport with terminal
                          and gate information (if available). You can edit if
                          needed.
                        </span>
                      ) : (
                        "Enter the airport terminal or drop-off point"
                      )}
                    </p>
                  )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="pickupTime"
          render={({ field }) => (
            <DateTimePicker
              label="Pickup Time"
              value={field.value}
              onChange={field.onChange}
              autoSet={!!flightData}
            />
          )}
        />

        {rideType === "BOOK_BY_HOUR" && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 1 : parseInt(e.target.value)
                      )
                    }
                    value={field.value ?? 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RIDE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fare (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1.00"
                  placeholder="0.00"
                  defaultValue={"120.00"}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : parseFloat(e.target.value)
                    )
                  }
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ride Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Notes about this ride..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
