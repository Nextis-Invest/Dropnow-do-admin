import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// GET /api/mobile/connect - Validate a connection token
export async function GET(req: NextRequest) {
  try {
    // Get the token and base URL from the query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const baseUrl = url.searchParams.get("baseUrl");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Find the connection token in the database
    const connectionToken = await prisma.connectionToken.findUnique({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!connectionToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // This is a simple validation endpoint - we don't mark the token as used here
    // The token will be marked as used when the driver connects with their information

    // Get the base URL from the query parameters or use a default
    const apiBaseUrl =
      baseUrl ||
      `${
        process.env.NEXT_PUBLIC_APP_URL || "https://dropnow-do-admin.vercel.app"
      }/api`;

    // Return success with the token information and base URL
    return NextResponse.json(
      {
        success: true,
        token: connectionToken.token,
        expiresAt: connectionToken.expiresAt,
        apiBaseUrl: apiBaseUrl, // Include the API base URL in the response
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error validating connection token:", error);
    return NextResponse.json(
      { error: "Failed to validate connection token" },
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

// POST /api/mobile/connect - Connect a mobile device using a token
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data);
    const { token, deviceInfo, driverInfo, baseUrl } = data;

    // Get the base URL from the request or use a default
    const apiBaseUrl =
      baseUrl ||
      `${
        process.env.NEXT_PUBLIC_APP_URL || "https://dropnow-do-admin.vercel.app"
      }/api`;

    // Driver info is required when connecting
    if (!driverInfo || !driverInfo.externalId) {
      return NextResponse.json(
        { error: "Driver information with externalId is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Find the connection token in the database
    const connectionToken = await prisma.connectionToken.findUnique({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!connectionToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Mark the token as used
    await prisma.connectionToken.update({
      where: {
        id: connectionToken.id,
      },
      data: {
        isUsed: true,
      },
    });

    // For this implementation, we'll always treat this as an external user (driver)
    // Find or create the external user based on the provided driver information
    let externalUser = await prisma.driver.findUnique({
      where: { externalId: driverInfo.externalId },
    });

    if (!externalUser) {
      // Create a new external user with the provided information
      externalUser = await prisma.driver.create({
        data: {
          externalId: driverInfo.externalId,
          firstName: driverInfo.firstName || null,
          lastName: driverInfo.lastName || null,
          email: driverInfo.email || null,
          phone: driverInfo.phone || null,
          lastConnected: new Date(),
        },
      });
    } else {
      // Update the existing external user with any new information
      externalUser = await prisma.driver.update({
        where: { id: externalUser.id },
        data: {
          firstName: driverInfo.firstName || externalUser.firstName,
          lastName: driverInfo.lastName || externalUser.lastName,
          email: driverInfo.email || externalUser.email,
          phone: driverInfo.phone || externalUser.phone,
          lastConnected: new Date(),
        },
      });
    }

    // Link the connection token to the external user
    await prisma.connectionToken.update({
      where: { id: connectionToken.id },
      data: { externalUserId: externalUser.id },
    });

    // Set userInfo to the external user
    const userInfo = externalUser;

    // Store device information
    if (deviceInfo) {
      // Store device info in our database
      await prisma.mobileDevice.upsert({
        where: {
          deviceId: deviceInfo.deviceId || `unknown_${Date.now()}`,
        },
        update: {
          deviceName: deviceInfo.deviceName || null,
          deviceModel: deviceInfo.deviceModel || null,
          platform: deviceInfo.platform || null,
          lastActive: new Date(),
        },
        create: {
          deviceId: deviceInfo.deviceId || `unknown_${Date.now()}`,
          deviceName: deviceInfo.deviceName || null,
          deviceModel: deviceInfo.deviceModel || null,
          platform: deviceInfo.platform || null,
          lastActive: new Date(),
          externalUserId: userInfo.id,
        },
      });
    }

    // Fetch rides for the driver
    const driverRides = await prisma.ride.findMany({
      where: {
        externalPassengerId: externalUser.id,
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

    // Return user information, connection details, and rides for drivers
    return NextResponse.json(
      {
        success: true,
        user: {
          id: externalUser.id,
          externalId: externalUser.externalId,
          firstName: externalUser.firstName || "",
          lastName: externalUser.lastName || "",
          email: externalUser.email || "",
          phone: externalUser.phone || "",
        },
        // Include any additional information needed by the mobile app
        connectionInfo: {
          connectedAt: new Date(),
          // You can generate a session token or API key here if needed
          apiKey: `mobile_${externalUser.id}_${Date.now()}`,
          apiBaseUrl: apiBaseUrl, // Include the API base URL in the response
        },
        // Include rides for drivers
        rides: driverRides,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error connecting mobile device:", error);
    return NextResponse.json(
      { error: "Failed to connect mobile device" },
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
