import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { addHours } from "date-fns";

// POST /api/external-users/connection-token - Generate a connection token for an external user
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (only admin users can generate tokens)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We don't need any user information at this point
    // The driver will send their information when they scan the QR code
    const data = await req.json();

    // Generate a random token
    const token = randomBytes(32).toString("hex");

    // Set expiration time (1 hour from now)
    const expiresAt = addHours(new Date(), 1);

    // Create a connection token in the database without linking to a user yet
    // The user will be created or linked when they scan the QR code
    const connectionToken = await prisma.connectionToken.create({
      data: {
        token,
        expiresAt,
      },
    });

    // Generate a QR code with the token and base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://dropnow-do-admin.vercel.app";
    const apiBaseUrl = `${baseUrl}/api`;
    // Include the API base URL in the QR code so the mobile app knows where to make requests
    const connectionUrl = `${apiBaseUrl}/mobile/connect?token=${token}&baseUrl=${encodeURIComponent(
      apiBaseUrl
    )}`;

    const qrCodeDataUrl = await QRCode.toDataURL(connectionUrl);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      token: connectionToken.token,
      expiresAt: connectionToken.expiresAt,
      apiBaseUrl: apiBaseUrl, // Include the API base URL in the response
    });
  } catch (error) {
    console.error("Error generating connection token:", error);
    return NextResponse.json(
      { error: "Failed to generate connection token" },
      { status: 500 }
    );
  }
}

// GET /api/external-users/connection-token - Get all connection tokens for an external user
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the external user ID from the query parameters
    const url = new URL(req.url);
    const externalId = url.searchParams.get("externalId");

    if (!externalId) {
      return NextResponse.json(
        { error: "External user ID is required" },
        { status: 400 }
      );
    }

    // Find the external user
    const externalUser = await prisma.driver.findUnique({
      where: { externalId },
    });

    if (!externalUser) {
      return NextResponse.json(
        { error: "External user not found" },
        { status: 404 }
      );
    }

    // Get all active (not used and not expired) connection tokens for the external user
    const connectionTokens = await prisma.connectionToken.findMany({
      where: {
        externalUserId: externalUser.id,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      connectionTokens,
    });
  } catch (error) {
    console.error("Error fetching connection tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection tokens" },
      { status: 500 }
    );
  }
}
