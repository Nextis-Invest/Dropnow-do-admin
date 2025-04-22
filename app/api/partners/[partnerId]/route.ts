import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners/[partnerId] - Get a specific partner
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId;

    // Get partner with related data
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
      include: {
        vehicles: true,
        eventParticipations: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        missionPartners: {
          include: {
            mission: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        ridePartners: {
          include: {
            ride: {
              select: {
                id: true,
                rideNumber: true,
                pickupTime: true,
                dropoffTime: true,
                status: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
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

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[partnerId] - Update a specific partner
export async function PUT(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId;
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if partner exists
    const existingPartner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (
      data.email !== existingPartner.email &&
      (await db.partner.findUnique({ where: { email: data.email } }))
    ) {
      return NextResponse.json(
        { error: "A partner with this email already exists" },
        { status: 400 }
      );
    }

    // Update the partner
    const updatedPartner = await db.partner.update({
      where: { id: partnerId },
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
        type: data.type,
        status: data.status,
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

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[partnerId] - Delete a specific partner
export async function DELETE(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId;

    // Check if partner exists
    const existingPartner = await db.partner.findUnique({
      where: { id: partnerId },
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

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Check if partner has related records
    const hasRelatedRecords =
      existingPartner._count.vehicles > 0 ||
      existingPartner._count.eventParticipations > 0 ||
      existingPartner._count.missionPartners > 0 ||
      existingPartner._count.ridePartners > 0;

    if (hasRelatedRecords) {
      return NextResponse.json(
        {
          error:
            "Cannot delete partner with related records. Please remove all related records first.",
        },
        { status: 400 }
      );
    }

    // Delete the partner
    await db.partner.delete({
      where: { id: partnerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
