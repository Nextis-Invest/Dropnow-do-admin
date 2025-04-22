"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Truck,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Partner } from "../page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.partnerId as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch partner data
  useEffect(() => {
    const fetchPartner = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/partners/${partnerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch partner");
        }

        const data = await response.json();
        setPartner(data);
      } catch (error) {
        console.error("Error fetching partner:", error);
        toast.error("Failed to load partner details");
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get partner type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "EXTERNAL":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "AFFILIATE":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header with back button */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {loading ? (
                        <Skeleton className="h-8 w-64" />
                      ) : (
                        partner?.name
                      )}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      {loading ? (
                        <Skeleton className="h-5 w-24" />
                      ) : (
                        partner && (
                          <>
                            <Badge
                              variant="outline"
                              className={getTypeColor(partner.type)}
                            >
                              {partner.type.charAt(0) +
                                partner.type.slice(1).toLowerCase()}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusColor(partner.status)}
                            >
                              {partner.status.charAt(0) +
                                partner.status.slice(1).toLowerCase()}
                            </Badge>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Details */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    {loading ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <Skeleton className="h-6 w-32" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-24 w-full" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <Skeleton className="h-6 w-32" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-24 w-full" />
                          </CardContent>
                        </Card>
                      </div>
                    ) : partner ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Contact Information */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Contact Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium">Email</div>
                                  <div className="text-sm text-muted-foreground">
                                    {partner.email}
                                  </div>
                                </div>
                              </div>

                              {partner.phone && (
                                <div className="flex items-start gap-3">
                                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div className="font-medium">Phone</div>
                                    <div className="text-sm text-muted-foreground">
                                      {partner.phone}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {partner.website && (
                                <div className="flex items-start gap-3">
                                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div className="font-medium">Website</div>
                                    <div className="text-sm text-muted-foreground">
                                      <a
                                        href={partner.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                      >
                                        {partner.website}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(partner.address ||
                                partner.city ||
                                partner.country) && (
                                <div className="flex items-start gap-3">
                                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div className="font-medium">Address</div>
                                    <div className="text-sm text-muted-foreground">
                                      {partner.address && (
                                        <div>{partner.address}</div>
                                      )}
                                      <div>
                                        {[
                                          partner.city,
                                          partner.postalCode,
                                          partner.country,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Partner Details */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Partner Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-start gap-3">
                                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium">Type</div>
                                  <div className="text-sm text-muted-foreground">
                                    {partner.type.charAt(0) +
                                      partner.type.slice(1).toLowerCase()}{" "}
                                    Partner
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium">Joined</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(partner.createdAt.toString())}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium">Vehicles</div>
                                  <div className="text-sm text-muted-foreground">
                                    {partner._count?.vehicles || 0} vehicles
                                    registered
                                  </div>
                                </div>
                              </div>

                              {partner.notes && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="font-medium mb-1">Notes</div>
                                  <div className="text-sm text-muted-foreground">
                                    {partner.notes}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Activity Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Activity Summary
                            </CardTitle>
                            <CardDescription>
                              Recent activity with this partner
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Events
                                </div>
                                <div className="text-2xl font-bold">
                                  {partner._count?.eventParticipations || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total events participated in
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Missions
                                </div>
                                <div className="text-2xl font-bold">
                                  {partner._count?.missionPartners || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total missions assigned
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">Rides</div>
                                <div className="text-2xl font-bold">
                                  {partner._count?.ridePartners || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total rides provided
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <h3 className="text-lg font-medium">
                              Partner not found
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              The partner you're looking for doesn't exist or
                              you don't have permission to view it.
                            </p>
                            <Button
                              className="mt-4"
                              onClick={() => router.push("/partners")}
                            >
                              Back to Partners
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Vehicles Tab */}
                  <TabsContent value="vehicles" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vehicles</CardTitle>
                        <CardDescription>
                          Vehicles registered to this partner
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : partner && partner._count?.vehicles ? (
                          <div className="space-y-4">
                            {partner.vehicles ? (
                              partner.vehicles.map((vehicle: any) => (
                                <div
                                  key={vehicle.id}
                                  className="flex items-center justify-between border-b pb-2"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {vehicle.make} {vehicle.model} (
                                      {vehicle.year})
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {vehicle.licensePlate} •{" "}
                                      {vehicle.vehicleType}
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {vehicle.status}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p>Vehicle details not loaded</p>
                                <Button variant="outline" className="mt-2">
                                  Load Vehicles
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">
                              No vehicles registered
                            </p>
                            <Button variant="outline" className="mt-4">
                              Add Vehicle
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Events</CardTitle>
                        <CardDescription>
                          Events this partner is participating in
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : partner && partner._count?.eventParticipations ? (
                          <div className="space-y-4">
                            {partner.eventParticipations ? (
                              partner.eventParticipations.map(
                                (participation: any) => (
                                  <div
                                    key={participation.id}
                                    className="flex items-center justify-between border-b pb-2"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        <Link
                                          href={`/events/${participation.event.id}`}
                                          className="hover:underline"
                                        >
                                          {participation.event.title}
                                        </Link>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDate(
                                          participation.event.startDate
                                        )}{" "}
                                        -{" "}
                                        {formatDate(
                                          participation.event.endDate
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {participation.event.status}
                                    </Badge>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="text-center py-4">
                                <p>Event details not loaded</p>
                                <Button variant="outline" className="mt-2">
                                  Load Events
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">
                              No events found
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Financial Tab */}
                  <TabsContent value="financial" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Information</CardTitle>
                        <CardDescription>
                          Financial details and payment information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                          </div>
                        ) : partner ? (
                          <div className="space-y-6">
                            {/* Rates and Fees */}
                            <div>
                              <h3 className="text-lg font-medium mb-3">
                                Rates and Fees
                              </h3>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Current Balance
                                  </div>
                                  <div className="text-2xl font-bold">
                                    ${partner.balance.toFixed(2)}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Commission Rate
                                  </div>
                                  <div className="text-2xl font-bold">
                                    {partner.commissionRate
                                      ? `${partner.commissionRate}%`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Rate per Kilometer
                                  </div>
                                  <div className="text-lg">
                                    {partner.ratePerKm
                                      ? `$${partner.ratePerKm.toFixed(2)}`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Rate per Hour
                                  </div>
                                  <div className="text-lg">
                                    {partner.ratePerHour
                                      ? `$${partner.ratePerHour.toFixed(2)}`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Minimum Fare
                                  </div>
                                  <div className="text-lg">
                                    {partner.minimumFare
                                      ? `$${partner.minimumFare.toFixed(2)}`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Payment Terms
                                  </div>
                                  <div className="text-lg">
                                    {partner.paymentTerms || "—"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Banking Information */}
                            <div className="pt-4 border-t">
                              <h3 className="text-lg font-medium mb-3">
                                Banking Information
                              </h3>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Bank Name
                                  </div>
                                  <div className="text-lg">
                                    {partner.bankName || "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Account Number
                                  </div>
                                  <div className="text-lg">
                                    {partner.bankAccountNumber
                                      ? `****${partner.bankAccountNumber.slice(
                                          -4
                                        )}`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Routing Number
                                  </div>
                                  <div className="text-lg">
                                    {partner.bankRoutingNumber
                                      ? `****${partner.bankRoutingNumber.slice(
                                          -4
                                        )}`
                                      : "—"}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    Tax ID
                                  </div>
                                  <div className="text-lg">
                                    {partner.taxId || "—"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">
                              Partner not found
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
