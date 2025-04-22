import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/rides/[rideId] - Get a specific ride
export async function GET(
  req: NextRequest,
  { params }: { params: { rideId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.rideId;

    // Get ride with related data
    const ride = await db.ride.findUnique({
      where: { id: rideId },
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
            phone: true,
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
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
            eventId: true,
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Format the ride for the frontend
    const formattedRide = {
      id: ride.id,
      rideNumber: ride.rideNumber,
      // Use passenger info from relations or direct fields
      passenger: ride.passenger ||
        ride.externalPassenger || {
          firstName: ride.passengerFirstName,
          lastName: ride.passengerLastName,
          email: ride.passengerEmail,
          phone: ride.passengerPhone,
        },
      passengerCount: ride.passengerCount || 1,
      chauffeur: ride.chauffeur,
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
      notes: ride.notes,
      createdAt: ride.createdAt.toISOString(),
      updatedAt: ride.updatedAt.toISOString(),
      booking: ride.booking,
      mission: ride.mission,
    };

    return NextResponse.json(formattedRide);
  } catch (error) {
    console.error("Error fetching ride:", error);
    return NextResponse.json(
      { error: "Failed to fetch ride" },
      { status: 500 }
    );
  }
}

// PUT /api/rides/[rideId] - Update a specific ride
export async function PUT(
  req: NextRequest,
  { params }: { params: { rideId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.rideId;
    const data = await req.json();

    // Check if ride exists
    const existingRide = await db.ride.findUnique({
      where: { id: rideId },
    });

    if (!existingRide) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Update the ride
    const updatedRide = await db.ride.update({
      where: { id: rideId },
      data: {
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        pickupTime: data.pickupTime ? new Date(data.pickupTime) : undefined,
        dropoffTime: data.dropoffTime ? new Date(data.dropoffTime) : null,
        // Coordinates
        pickupLatitude:
          data.pickupLatitude !== undefined
            ? parseFloat(data.pickupLatitude.toString())
            : undefined,
        pickupLongitude:
          data.pickupLongitude !== undefined
            ? parseFloat(data.pickupLongitude.toString())
            : undefined,
        dropoffLatitude:
          data.dropoffLatitude !== undefined
            ? parseFloat(data.dropoffLatitude.toString())
            : undefined,
        dropoffLongitude:
          data.dropoffLongitude !== undefined
            ? parseFloat(data.dropoffLongitude.toString())
            : undefined,
        status: data.status,
        rideType: data.rideType,
        airportTransferType: data.airportTransferType,
        flightNumber: data.flightNumber,
        fare: data.fare !== undefined ? data.fare : undefined,
        distance: data.distance !== undefined ? data.distance : undefined,
        duration: data.duration,
        notes: data.notes,
        chauffeurId: data.chauffeurId || undefined,
        // Update passenger information if provided
        passengerFirstName:
          data.passenger?.firstName || data.passengerFirstName,
        passengerLastName: data.passenger?.lastName || data.passengerLastName,
        passengerEmail: data.passenger?.email || data.passengerEmail,
        passengerPhone: data.passenger?.phone || data.passengerPhone,
        passengerCount: data.passengerCount || 1,
      },
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
            phone: true,
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
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
      },
    });

    return NextResponse.json(updatedRide);
  } catch (error) {
    console.error("Error updating ride:", error);
    return NextResponse.json(
      { error: "Failed to update ride" },
      { status: 500 }
    );
  }
}

// DELETE /api/rides/[rideId] - Delete a specific ride
export async function DELETE(
  req: NextRequest,
  { params }: { params: { rideId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rideId = params.rideId;

    // Check if ride exists
    const existingRide = await db.ride.findUnique({
      where: { id: rideId },
    });

    if (!existingRide) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Delete the ride
    await db.ride.delete({
      where: { id: rideId },
    });

    return NextResponse.json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    return NextResponse.json(
      { error: "Failed to delete ride" },
      { status: 500 }
    );
  }
}
