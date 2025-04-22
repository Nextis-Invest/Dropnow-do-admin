import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/external-users - Get all external users (drivers)
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const search = url.searchParams.get("search");

    // Build filter object
    const where: any = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { externalId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch external users from the database
    const externalUsers = await prisma.driver.findMany({
      where,
      orderBy: [
        { lastConnected: "desc" },
        { firstName: "asc" },
        { lastName: "asc" },
      ],
      include: {
        mobileDevices: {
          orderBy: {
            lastActive: "desc",
          },
          take: 1,
        },
      },
    });

    // Format the response
    const formattedUsers = externalUsers.map((user) => ({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      externalId: user.externalId,
      lastConnected: user.lastConnected,
      deviceInfo:
        user.mobileDevices.length > 0
          ? {
              deviceName: user.mobileDevices[0].deviceName,
              deviceModel: user.mobileDevices[0].deviceModel,
              platform: user.mobileDevices[0].platform,
              lastActive: user.mobileDevices[0].lastActive,
            }
          : null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching external users:", error);
    return NextResponse.json(
      { error: "Failed to fetch external users" },
      { status: 500 }
    );
  }
}
