// src/lib/rideFormUtils.ts
import * as React from "react";
import { MapPinIcon } from "lucide-react";
import {
  RIDE_CATEGORIES,
  MISSION_RIDE_CATEGORIES,
  MILESTONE_TYPES,
  AIRPORT_TRANSFER_SUBTYPES,
  DEFAULT_DURATION,
  DEFAULT_PASSENGER_COUNT,
} from "../constants";
import type { RideFormValues, MissionFormValues } from "./rideFormTypes";

export const getDefaultMissionValues = (): Partial<MissionFormValues> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    title: "",
    clientId: "",
    startDate: today,
    endDate: tomorrow,
    duration: DEFAULT_DURATION,
    status: "SCHEDULED",
    isExternalPartner: false,
    passengerIds: [],
    rides: [],
    notes: "",
  };
};

export const getDefaultRideValues = (
  defaults?: Partial<RideFormValues>
): RideFormValues => ({
  // Step 1: Ride Type
  category: defaults?.category || "CITY_TRANSFER",
  airportTransferSubtype: defaults?.airportTransferSubtype,

  // Step 2: Event
  eventId: defaults?.eventId || "",

  // Step 3: Client
  clientId: defaults?.clientId || "",

  // Step 4: Passenger
  useExistingPassenger: defaults?.useExistingPassenger ?? true,
  passengerId: defaults?.passengerId || "",
  passengerInfo: {
    firstName: defaults?.passengerInfo?.firstName || "",
    lastName: defaults?.passengerInfo?.lastName || "",
    phoneNumber: defaults?.passengerInfo?.phoneNumber || "",
    passengerCount:
      defaults?.passengerInfo?.passengerCount ?? DEFAULT_PASSENGER_COUNT,
    description: defaults?.passengerInfo?.description || "",
  },

  // Step 5: Location Details
  status: defaults?.status || "SCHEDULED",
  pickupAddress: defaults?.pickupAddress || "",
  dropoffAddress: defaults?.dropoffAddress || "",
  pickupTime: defaults?.pickupTime || new Date(),
  duration: defaults?.duration,
  flightNumber: defaults?.flightNumber || "",
  notes: defaults?.notes || "",
  fare: defaults?.fare,

  // Additional fields
  milestones: defaults?.milestones || [],
  isMission: defaults?.isMission || false,
  mission: defaults?.isMission
    ? {
        title: defaults?.mission?.title || "",
        clientId: defaults?.mission?.clientId || "",
        isExternalPartner: defaults?.mission?.isExternalPartner ?? false,
        status: defaults?.mission?.status || "SCHEDULED",
        passengerIds: defaults?.mission?.passengerIds || [],
        startDate: defaults?.mission?.startDate || new Date(),
        endDate:
          defaults?.mission?.endDate ||
          new Date(new Date().setDate(new Date().getDate() + 1)),
        duration: defaults?.mission?.duration ?? DEFAULT_DURATION,
        rides: defaults?.mission?.rides || [],
        notes: defaults?.mission?.notes || "",
        chauffeurId: defaults?.mission?.chauffeurId,
        partnerId: defaults?.mission?.partnerId,
        projectId: defaults?.mission?.projectId,
        totalBudget: defaults?.mission?.totalBudget,
        partnerFee: defaults?.mission?.partnerFee,
      }
    : undefined,
});

export const getRideCategoryLabel = (
  category: (typeof RIDE_CATEGORIES)[number] | string
): string => {
  switch (category) {
    case "CITY_TRANSFER":
      return "City Transfer";
    case "AIRPORT_TRANSFER":
      return "Airport Transfer";
    case "TRAIN_STATION_TRANSFER":
      return "Train Station Transfer";
    case "BOOK_BY_HOUR":
      return "Book by Hour";
    default:
      return category;
  }
};

export const getAirportTransferSubtypeLabel = (
  subtype: (typeof AIRPORT_TRANSFER_SUBTYPES)[number] | string
): string => {
  switch (subtype) {
    case "AIRPORT_PICKUP":
      return "Airport Pickup (From Airport)";
    case "AIRPORT_DROPOFF":
      return "Airport Dropoff (To Airport)";
    default:
      return subtype;
  }
};
export const getMissionRideCategoryLabel = (
  category: (typeof MISSION_RIDE_CATEGORIES)[number] | string
): string => {
  switch (category) {
    case "CITY_TRANSFER":
      return "City Transfer";
    case "AIRPORT_TRANSFER":
      return "Airport Transfer";
    case "TRAIN_STATION_TRANSFER":
      return "Train Station Transfer";
    case "BOOK_BY_HOUR":
      return "Book by Hour";
    default:
      return category;
  }
};

export const getMilestoneTypeIcon = (
  type: (typeof MILESTONE_TYPES)[number]
) => {
  if (type === "PICKUP") {
    return React.createElement(MapPinIcon, {
      className: "mr-2 h-4 w-4 text-green-500",
    });
  }
  return React.createElement(MapPinIcon, {
    className: "mr-2 h-4 w-4 text-red-500",
  });
};
