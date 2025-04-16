import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET /api/rides - Get all rides
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : undefined;
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Build the query
    let query: any = {};

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.OR = [
        { rideNumber: { contains: search, mode: "insensitive" } },
        { pickupAddress: { contains: search, mode: "insensitive" } },
        { dropoffAddress: { contains: search, mode: "insensitive" } },
        {
          passenger: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          chauffeur: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          externalPassenger: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get rides with related data
    const rides = await db.ride.findMany({
      where: query,
      select: {
        id: true,
        rideNumber: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupTime: true,
        dropoffTime: true,
        // Coordinates
        pickupLatitude: true,
        pickupLongitude: true,
        dropoffLatitude: true,
        dropoffLongitude: true,
        status: true,
        rideType: true,
        airportTransferType: true,
        flightNumber: true,
        fare: true,
        distance: true,
        duration: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        // Direct passenger fields
        passengerFirstName: true,
        passengerLastName: true,
        passengerEmail: true,
        passengerPhone: true,
        passengerCount: true,
        // Relations
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        externalPassenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            clientId: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        mission: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        pickupTime: "desc",
      },
      ...(limit ? { take: limit } : {}),
    });

    // Format the rides for the frontend
    const formattedRides = rides.map((ride) => {
      const passengerName = ride.passenger
        ? `${ride.passenger.firstName} ${ride.passenger.lastName}`
        : ride.externalPassenger
        ? `${ride.externalPassenger.firstName} ${ride.externalPassenger.lastName}`
        : ride.passengerFirstName && ride.passengerLastName
        ? `${ride.passengerFirstName} ${ride.passengerLastName}`
        : "No passenger";

      const chauffeurName = ride.chauffeur
        ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName}`
        : null;

      return {
        id: ride.id,
        rideNumber: ride.rideNumber,
        passengerName,
        chauffeurName,
        pickupAddress: ride.pickupAddress,
        dropoffAddress: ride.dropoffAddress,
        pickupTime: ride.pickupTime.toISOString(),
        dropoffTime: ride.dropoffTime ? ride.dropoffTime.toISOString() : null,
        // Coordinates
        pickupLatitude: ride.pickupLatitude
          ? parseFloat(ride.pickupLatitude.toString())
          : 48.8566,
        pickupLongitude: ride.pickupLongitude
          ? parseFloat(ride.pickupLongitude.toString())
          : 2.3522,
        dropoffLatitude: ride.dropoffLatitude
          ? parseFloat(ride.dropoffLatitude.toString())
          : 48.8566,
        dropoffLongitude: ride.dropoffLongitude
          ? parseFloat(ride.dropoffLongitude.toString())
          : 2.3522,
        status: ride.status,
        rideType: ride.rideType,
        airportTransferType: ride.airportTransferType,
        flightNumber: ride.flightNumber,
        fare: ride.fare ? parseFloat(ride.fare.toString()) : 0,
        distance: ride.distance ? parseFloat(ride.distance.toString()) : 0,
        duration: ride.duration || 0,
        createdAt: ride.createdAt.toISOString(),
        updatedAt: ride.updatedAt.toISOString(),
        booking: ride.booking,
        mission: ride.mission,
      };
    });

    return NextResponse.json(formattedRides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json(
      { error: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}

// POST /api/rides - Create a new ride
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Creating ride with data:", JSON.stringify(data, null, 2));

    // Generate a ride number
    const rideNumber = `RD-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Handle passenger information
    const passengerInfo = data.passengerInfo
      ? {
          passengerFirstName: data.passengerInfo.firstName,
          passengerLastName: data.passengerInfo.lastName,
          passengerEmail: data.passengerInfo.email || null,
          passengerPhone: data.passengerInfo.phoneNumber || null,
          passengerCount: data.passengerInfo.passengerCount || 1,
        }
      : {};

    // Make sure we're not accidentally including clientId in the ride data
    const { clientId, ...dataWithoutClientId } = data;
    console.log(
      "Data without clientId:",
      JSON.stringify(dataWithoutClientId, null, 2)
    );

    // Prepare the ride data
    const rideData: any = {
      rideNumber,
      // Connect to the chauffeur (ExternalUser) if an ID is provided
      ...(data.chauffeurId
        ? {
            chauffeur: {
              connect: { id: data.chauffeurId },
            },
          }
        : {}),
      // Include passenger information directly in the ride
      ...passengerInfo,
      pickupAddress: dataWithoutClientId.pickupAddress,
      dropoffAddress: dataWithoutClientId.dropoffAddress || "",
      pickupTime: new Date(dataWithoutClientId.pickupTime),
      dropoffTime: dataWithoutClientId.dropoffTime
        ? new Date(dataWithoutClientId.dropoffTime)
        : null,
      // Coordinates
      pickupLatitude: dataWithoutClientId.pickupLatitude
        ? parseFloat(dataWithoutClientId.pickupLatitude.toString())
        : 48.8566, // Default to Paris
      pickupLongitude: dataWithoutClientId.pickupLongitude
        ? parseFloat(dataWithoutClientId.pickupLongitude.toString())
        : 2.3522,
      dropoffLatitude: dataWithoutClientId.dropoffLatitude
        ? parseFloat(dataWithoutClientId.dropoffLatitude.toString())
        : 48.8566,
      dropoffLongitude: dataWithoutClientId.dropoffLongitude
        ? parseFloat(dataWithoutClientId.dropoffLongitude.toString())
        : 2.3522,
      status: dataWithoutClientId.status || "SCHEDULED",
      rideType: dataWithoutClientId.category,
      airportTransferType: dataWithoutClientId.airportTransferSubtype || null,
      flightNumber: dataWithoutClientId.flightNumber || null,
      fare: dataWithoutClientId.fare
        ? parseFloat(dataWithoutClientId.fare.toString())
        : null,
      distance: dataWithoutClientId.distance
        ? parseFloat(dataWithoutClientId.distance.toString())
        : null,
      duration: dataWithoutClientId.duration || null,
      notes: dataWithoutClientId.notes || null,
    };

    // Log chauffeur assignment
    if (dataWithoutClientId.chauffeurId) {
      console.log(
        `Connecting ride to external driver with ID ${dataWithoutClientId.chauffeurId}`
      );
    }

    // If this ride is part of a mission, create or link to the mission
    if (dataWithoutClientId.isMission && dataWithoutClientId.mission) {
      // Log mission chauffeur assignment
      if (dataWithoutClientId.mission.chauffeurId) {
        console.log(
          `Mission will be assigned to chauffeur with ID ${dataWithoutClientId.mission.chauffeurId}`
        );
      }

      rideData.mission = {
        connectOrCreate: {
          where: { id: dataWithoutClientId.mission.id || "" },
          create: {
            title: dataWithoutClientId.mission.title || "New Mission",
            startDate: dataWithoutClientId.mission.startDate
              ? new Date(dataWithoutClientId.mission.startDate)
              : new Date(),
            endDate: dataWithoutClientId.mission.endDate
              ? new Date(dataWithoutClientId.mission.endDate)
              : new Date(new Date().setDate(new Date().getDate() + 1)),
            status: dataWithoutClientId.mission.status || "SCHEDULED",
            // Note: chauffeurId is not a field in the Mission model
            // Chauffeurs are assigned to individual rides, not to missions
            eventId: dataWithoutClientId.eventId,
          },
        },
      };
    }

    // Note: Rides are linked to events through missions, not directly
    // The eventId is used when creating a mission

    // Check if the user exists in our database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.log(`User with clerkId ${userId} not found in database`);
      // You might want to handle this case differently, e.g., by creating a user record
      // or by using a default user ID
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 400 }
      );
    }

    console.log(`Found user in database: ${user.id}`);

    // Link to client/booking (required for a ride)
    rideData.booking = {
      connectOrCreate: {
        where: { id: dataWithoutClientId.bookingId || "" },
        create: {
          bookingNumber: `BK-${uuidv4().substring(0, 8).toUpperCase()}`,
          client: {
            connect: { id: clientId || "clkwxvvxs0000qgmw9t6ybcqj" }, // Use a default client ID if not provided
          },
          status: "CONFIRMED",
          // Connect to the user as customer (required for booking)
          customer: {
            connect: {
              id: user.id, // Use the database user ID, not the Clerk ID
            },
          },
        },
      },
    };

    // Log the final ride data before creating
    console.log("Final ride data:", JSON.stringify(rideData, null, 2));

    // Create the ride
    const ride = await db.ride.create({
      data: rideData,
      include: {
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        externalPassenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            externalId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        mission: true,
        booking: {
          include: {
            client: true,
          },
        },
      },
    });

    // Format the response
    const formattedRide = {
      ...ride,
      passengerName: ride.passenger
        ? `${ride.passenger.firstName} ${ride.passenger.lastName}`
        : ride.externalPassenger
        ? `${ride.externalPassenger.firstName} ${ride.externalPassenger.lastName}`
        : ride.passengerFirstName && ride.passengerLastName
        ? `${ride.passengerFirstName} ${ride.passengerLastName}`
        : "No passenger",
      chauffeurName: ride.chauffeur
        ? `${ride.chauffeur.firstName || ""} ${
            ride.chauffeur.lastName || ""
          }`.trim() || `Driver ${ride.chauffeur.externalId}`
        : null,
    };

    return NextResponse.json(formattedRide);
  } catch (error) {
    console.error("Error creating ride:", error);

    // Extract error message
    let errorMessage = "Failed to create ride";
    let details = "Unknown error";

    if (error instanceof Error) {
      details = error.message;

      // Check for Prisma-specific errors
      if (error.name === "PrismaClientKnownRequestError") {
        const prismaError = error as any;
        if (prismaError.code === "P2002") {
          errorMessage = "Duplicate entry error";
          details = `A ride with this information already exists: ${
            prismaError.meta?.target || "unknown field"
          }`;
        } else if (prismaError.code === "P2003") {
          errorMessage = "Foreign key constraint failed";
          details = `Invalid reference: ${
            prismaError.meta?.field_name || "unknown field"
          }`;
        } else if (prismaError.code === "P2025") {
          errorMessage = "Record not found";
          details =
            prismaError.meta?.cause || "The referenced record was not found";
        }
      }
    } else if (typeof error === "object" && error !== null) {
      details = JSON.stringify(error);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: details,
      },
      { status: 500 }
    );
  }
}
