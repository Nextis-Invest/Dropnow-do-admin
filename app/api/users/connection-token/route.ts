import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { addHours } from "date-fns";

// POST /api/users/connection-token - Generate a connection token for a user
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { targetUserId } = data;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Check if the target user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a random token
    const token = randomBytes(32).toString("hex");

    // Set expiration time (1 hour from now)
    const expiresAt = addHours(new Date(), 1);

    // Create a connection token in the database
    const connectionToken = await prisma.connectionToken.create({
      data: {
        token,
        userId: targetUserId,
        expiresAt,
      },
    });

    // Generate a QR code with the token
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://dropnow-do-admin.vercel.app";
    const connectionUrl = `${baseUrl}/api/mobile/connect?token=${token}`;

    const qrCodeDataUrl = await QRCode.toDataURL(connectionUrl);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      token: connectionToken.token,
      expiresAt: connectionToken.expiresAt,
    });
  } catch (error) {
    console.error("Error generating connection token:", error);
    return NextResponse.json(
      { error: "Failed to generate connection token" },
      { status: 500 }
    );
  }
}

// GET /api/users/connection-token - Get all connection tokens for a user
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user ID from the query parameters
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all active (not used and not expired) connection tokens for the user
    const connectionTokens = await prisma.connectionToken.findMany({
      where: {
        userId: targetUserId,
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
