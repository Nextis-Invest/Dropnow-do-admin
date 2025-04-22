import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners - Get all partners
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch partners from the database
    const partners = await db.partner.findMany({
      where: filter,
      orderBy: [
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            vehicles: true,
            eventParticipations: true,
            missionPartners: true,
            ridePartners: true,
          },
        },
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create a new partner
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if partner with the same email already exists
    const existingPartner = await db.partner.findUnique({
      where: { email: data.email },
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: "A partner with this email already exists" },
        { status: 400 }
      );
    }

    // Create the partner
    const partner = await db.partner.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        website: data.website,
        logoUrl: data.logoUrl,
        type: data.type || "EXTERNAL",
        status: data.status || "ACTIVE",
        notes: data.notes,
        // Financial information
        balance: data.balance ? parseFloat(data.balance) : 0,
        ratePerKm: data.ratePerKm ? parseFloat(data.ratePerKm) : null,
        ratePerHour: data.ratePerHour ? parseFloat(data.ratePerHour) : null,
        minimumFare: data.minimumFare ? parseFloat(data.minimumFare) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
        paymentTerms: data.paymentTerms,
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankRoutingNumber: data.bankRoutingNumber,
        taxId: data.taxId,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
