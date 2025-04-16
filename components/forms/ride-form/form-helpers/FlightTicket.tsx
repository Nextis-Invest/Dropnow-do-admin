"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  BriefcaseIcon,
  Clock,
  Calendar,
  ArrowRight,
  Luggage,
  Plane,
} from "lucide-react";

export interface FlightData {
  flight_date?: string;
  flight_status?: string;
  departure?: {
    airport?: string;
    timezone?: string;
    iata?: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
    estimated_runway?: string;
    actual_runway?: string;
  };
  arrival?: {
    airport?: string;
    timezone?: string;
    iata?: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
    estimated_runway?: string;
    actual_runway?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
  flight?: {
    number?: string;
    iata?: string;
    icao?: string;
  };
  aircraft?: {
    registration?: string;
    iata?: string;
    icao?: string;
    icao24?: string;
  };
  live?: {
    updated?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    direction?: number;
    speed_horizontal?: number;
    speed_vertical?: number;
    is_ground?: boolean;
  };
}

interface FlightTicketProps {
  flightData: FlightData;
  onClose: () => void;
  airportTransferSubtype?: string;
}

export const FlightTicket: React.FC<FlightTicketProps> = ({
  flightData,
  onClose,
  airportTransferSubtype,
}) => {
  if (!flightData || !flightData.flight) {
    return null;
  }

  const formatDate = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "N/A";
    try {
      return format(new Date(dateTimeStr), "d MMM yyyy");
    } catch (e) {
      return dateTimeStr;
    }
  };

  const formatTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "N/A";
    try {
      return format(new Date(dateTimeStr), "HH:mm");
    } catch (e) {
      return dateTimeStr;
    }
  };

  // Calculate flight duration
  const calculateDuration = () => {
    if (!flightData.departure?.scheduled || !flightData.arrival?.scheduled) {
      return "N/A";
    }

    try {
      const departureTime = new Date(flightData.departure.scheduled);
      const arrivalTime = new Date(flightData.arrival.scheduled);
      const durationMs = arrivalTime.getTime() - departureTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-4 overflow-hidden border border-border bg-white shadow-sm">
      {/* Header with flight info */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8">
            <img
              src={`https://ui-avatars.com/api/?name=${
                flightData.airline?.name || "Airline"
              }&background=random&color=fff&bold=true&size=40`}
              alt="Airline logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-medium">
              {flightData.flight?.iata || flightData.flight?.number}
            </div>
            <div className="text-xs text-muted-foreground">
              {flightData.airline?.name || "Airline"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {flightData.flight_status && (
            <Badge variant="outline" className="capitalize">
              {flightData.flight_status.toLowerCase()}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <BriefcaseIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Business</span>
            </div>
            <div className="flex items-center">
              <Luggage className="h-4 w-4 mr-1" />
              <span className="text-xs">2 bags</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flight details */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-8">
          {/* Departure */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {formatDate(flightData.departure?.scheduled)}
            </div>
            <div className="text-2xl font-bold">
              {formatTime(flightData.departure?.scheduled)}
            </div>
            <div className="text-sm font-medium">
              {flightData.departure?.iata} (
              {flightData.departure?.iata
                ? `${flightData.departure.iata.slice(0, 3)}`
                : "DEP"}
              )
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">
              {formatDate(flightData.arrival?.scheduled)}
            </div>
            <div className="text-2xl font-bold">
              {formatTime(flightData.arrival?.scheduled)}
            </div>
            <div className="text-sm font-medium">
              {flightData.arrival?.iata} (
              {flightData.arrival?.iata
                ? `${flightData.arrival.iata.slice(0, 3)}`
                : "ARR"}
              )
            </div>
          </div>
        </div>

        {/* Flight path visualization */}
        <div className="my-4 flex items-center justify-center relative py-2">
          <div className="h-0.5 w-full bg-gray-200 absolute"></div>
          <div className="flex justify-between w-full relative z-10">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="flex items-center justify-center bg-white px-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">
                  {calculateDuration()}
                </span>
                <Plane className="h-3 w-3 text-primary rotate-90" />
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>

      {/* Additional flight details */}
      <div className="border-t p-4">
        <h3 className="text-lg font-medium mb-2">
          {flightData.departure?.airport?.split(" ")[0] || "Origin"} to{" "}
          {flightData.arrival?.airport?.split(" ")[0] || "Destination"}
        </h3>
        <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-xs text-blue-700 mb-1">
            Airport Information for Ride:
          </p>
          {airportTransferSubtype === "AIRPORT_PICKUP" ? (
            <>
              <p className="text-sm font-medium text-green-700">
                <span className="font-bold">Pickup:</span>{" "}
                {flightData.arrival?.airport || "N/A"}
                <span className="ml-1 text-xs">(Arrival Airport)</span>
              </p>
              {(flightData.arrival?.terminal || flightData.arrival?.gate) && (
                <p className="text-xs text-green-700 mt-1">
                  {flightData.arrival?.terminal && (
                    <span className="font-medium">
                      Terminal {flightData.arrival.terminal}
                    </span>
                  )}
                  {flightData.arrival?.terminal &&
                    flightData.arrival?.gate &&
                    " - "}
                  {flightData.arrival?.gate && (
                    <span className="font-medium">
                      Gate {flightData.arrival.gate}
                    </span>
                  )}
                </p>
              )}
              <p className="text-xs text-blue-600 mt-1">
                This location (including terminal and gate if available) will be
                automatically set as your pickup location. Pickup time will be
                set to the flight arrival time.
              </p>
            </>
          ) : airportTransferSubtype === "AIRPORT_DROPOFF" ? (
            <>
              <p className="text-sm font-medium text-green-700">
                <span className="font-bold">Dropoff:</span>{" "}
                {flightData.departure?.airport || "N/A"}
                <span className="ml-1 text-xs">(Departure Airport)</span>
              </p>
              {(flightData.departure?.terminal ||
                flightData.departure?.gate) && (
                <p className="text-xs text-green-700 mt-1">
                  {flightData.departure?.terminal && (
                    <span className="font-medium">
                      Terminal {flightData.departure.terminal}
                    </span>
                  )}
                  {flightData.departure?.terminal &&
                    flightData.departure?.gate &&
                    " - "}
                  {flightData.departure?.gate && (
                    <span className="font-medium">
                      Gate {flightData.departure.gate}
                    </span>
                  )}
                </p>
              )}
              <p className="text-xs text-blue-600 mt-1">
                This location (including terminal and gate if available) will be
                automatically set as your dropoff location. Pickup time will be
                set to 3 hours before the flight departure.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">
                <span className="font-bold">Departure:</span>{" "}
                {flightData.departure?.airport || "N/A"}
              </p>
              <p className="text-sm font-medium">
                <span className="font-bold">Arrival:</span>{" "}
                {flightData.arrival?.airport || "N/A"}
              </p>
            </>
          )}
        </div>
        <div className="space-y-4">
          {/* Departure details */}
          <div className="flex items-start gap-3">
            <div className="mt-1 relative">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="absolute top-3 bottom-0 left-1.5 w-0.5 bg-gray-200"></div>
            </div>
            <div>
              <div className="font-medium">
                {formatTime(flightData.departure?.scheduled)}
              </div>
              <div className="text-sm">
                {flightData.departure?.airport || "Departure Airport"}
              </div>
              {flightData.departure?.terminal && (
                <div className="text-xs text-muted-foreground">
                  Terminal {flightData.departure.terminal}
                </div>
              )}
            </div>
          </div>

          {/* Arrival details */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
            <div>
              <div className="font-medium">
                {formatTime(flightData.arrival?.scheduled)}
              </div>
              <div className="text-sm">
                {flightData.arrival?.airport || "Arrival Airport"}
              </div>
              {flightData.arrival?.terminal && (
                <div className="text-xs text-muted-foreground">
                  Terminal {flightData.arrival.terminal}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 flex justify-end">
        <button
          onClick={onClose}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Close
        </button>
      </div>
    </Card>
  );
};
