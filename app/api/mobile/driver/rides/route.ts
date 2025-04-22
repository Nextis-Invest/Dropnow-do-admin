import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// GET /api/mobile/driver/rides - Get rides for a driver
export async function GET(req: NextRequest) {
  try {
    // Get the driver ID and API key from the query parameters
    const url = new URL(req.url);
    const driverId = url.searchParams.get("driverId");
    const apiKey = url.searchParams.get("apiKey");
    const baseUrl = url.searchParams.get("baseUrl");

    console.log(driverId, apiKey, baseUrl);

    // Get the base URL from the query parameters or use a default
    const apiBaseUrl =
      baseUrl ||
      `${
        process.env.NEXT_PUBLIC_APP_URL || "https://dropnow-do-admin.vercel.app"
      }/api`;

    if (!driverId || !apiKey) {
      return NextResponse.json(
        { error: "Driver ID and API key are required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Find the external user by ID
    const driver = await prisma.driver.findFirst({
      where: {
        externalId: driverId,
      },
    });
    console.log(driver);

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate the API key (in a real app, you'd use a more secure method)
    // This is a simple check that the API key contains the driver's ID
    if (!apiKey.includes(driver.id)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the last connected timestamp
    await prisma.driver.update({
      where: { id: driver.id },
      data: { lastConnected: new Date() },
    });

    // Fetch rides where the external user is the passenger
    const rides = await prisma.ride.findMany({
      where: {
        chauffeur: { externalId: driver.externalId },
        status: { in: ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] },
      },
      include: {
        booking: true,
        mission: true,
        chauffeur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        pickupTime: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        driver: {
          id: driver.id,
          externalId: driver.externalId,
          firstName: driver.firstName || "",
          lastName: driver.lastName || "",
          email: driver.email || "",
          phone: driver.phone || "",
        },
        apiBaseUrl: apiBaseUrl, // Include the API base URL in the response
        rides,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver rides" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
