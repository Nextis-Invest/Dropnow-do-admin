import { z } from "zod";
import {
  RIDE_STATUSES,
  RIDE_CATEGORIES,
  AIRPORT_TRANSFER_SUBTYPES,
} from "../constants";
import { passengerSchema } from "./passenger-schema";
import { missionSchema } from "./mission-schema";
import { milestoneSchema } from "./simple-ride-schema";

export const rideFormSchema = z
  .object({
    // Step 1: Ride Type
    category: z.enum(RIDE_CATEGORIES),
    airportTransferSubtype: z.enum(AIRPORT_TRANSFER_SUBTYPES).optional(),

    // Step 2: Event
    eventId: z.string().min(1, "Event is required"),

    // Step 3: Client
    clientId: z.string().min(1, "Client is required"),

    // Step 4: Passenger
    passengerInfo: passengerSchema,
    useExistingPassenger: z.boolean().default(false),

    // Step 5: Location Details
    pickupAddress: z.string().min(1, "Pickup address is required"),
    dropoffAddress: z.string().min(1, "Dropoff address is required").optional(),
    pickupTime: z.date({ required_error: "Pickup time is required" }),
    duration: z.number().optional(), // For BOOK_BY_HOUR type
    flightNumber: z.string().optional(), // For AIRPORT_TRANSFER type
    flightData: z.any().optional(), // Store flight data for use across steps
    // Coordinates
    pickupLatitude: z.number().optional(),
    pickupLongitude: z.number().optional(),
    dropoffLatitude: z.number().optional(),
    dropoffLongitude: z.number().optional(),
    status: z.enum(RIDE_STATUSES),
    fare: z.number().optional(),
    notes: z.string().optional(),

    // Driver assignment
    chauffeurId: z.string().optional(),

    // Additional fields
    milestones: z.array(milestoneSchema).optional().default([]),
    isMission: z.boolean().optional().default(false),
    mission: missionSchema.optional(),
  })
  .refine(
    (data) => !!data.passengerInfo?.firstName && !!data.passengerInfo?.lastName,
    {
      message: "First and last name are required for passengers.",
      path: ["passengerInfo.firstName"],
    }
  )
  .refine((data) => data.category !== "BOOK_BY_HOUR" || !!data.duration, {
    message: "Duration is required for Book by Hour rides.",
    path: ["duration"],
  })
  .refine((data) => data.category === "BOOK_BY_HOUR" || !!data.dropoffAddress, {
    message: "Dropoff address is required for this ride type.",
    path: ["dropoffAddress"],
  })
  .refine(
    (data) =>
      data.category !== "AIRPORT_TRANSFER" || !!data.airportTransferSubtype,
    {
      message: "Please select whether this is an airport pickup or dropoff.",
      path: ["airportTransferSubtype"],
    }
  )
  .refine(
    (data) => data.category !== "AIRPORT_TRANSFER" || !!data.flightNumber,
    {
      message: "Flight number is required for airport transfers.",
      path: ["flightNumber"],
    }
  );

export type RideFormValues = z.infer<typeof rideFormSchema>;
