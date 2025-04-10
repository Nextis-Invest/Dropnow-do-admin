"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { partnerFormSchema, type PartnerFormValues } from "../schemas/partner-schema";
import { vehicleFormSchema, type VehicleFormValues } from "../schemas/vehicle-schema";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PartnerDialog } from "../components/partner-dialog";
import { VehicleDialog } from "../components/vehicle-dialog";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Car,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontalIcon,
  Phone,
  PlusIcon,
  Receipt,
  TrashIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Vehicle type definition
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  isForeignPlate: boolean;
  color?: string;
  capacity: number;
  vehicleType: string;
  status: string;
  lastMaintenance?: string;
  createdAt: string;
  updatedAt: string;
  partnerId: string;
}

// Partner type definition
interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logoUrl?: string;
  type: "INTERNAL" | "EXTERNAL" | "AFFILIATE";
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
  notes?: string;
  balance: number;
  ratePerKm?: number;
  ratePerHour?: number;
  minimumFare?: number;
  commissionRate?: number;
  paymentTerms?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    eventParticipations: number;
    missionPartners: number;
    ridePartners: number;
    vehicles?: number;
  };
  eventParticipations: Array<{
    id: string;
    eventId: string;
    event: {
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    role: string;
    status: string;
    fee?: number;
  }>;
  missionPartners: Array<{
    id: string;
    missionId: string;
    mission: {
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    role: string;
    status: string;
    fee?: number;
  }>;
  ridePartners: Array<{
    id: string;
    rideId: string;
    ride: {
      id: string;
      rideNumber: string;
      pickupAddress: string;
      dropoffAddress: string;
      pickupTime: string;
      status: string;
    };
    role: string;
    status: string;
    fee?: number;
  }>;
}

export default function PartnerDetailPage() {
  const router = useRouter();
  const { partnerId } = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [showDeleteVehicleDialog, setShowDeleteVehicleDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Initialize partner form with react-hook-form and zod validation
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      logoUrl: "",
      type: "EXTERNAL",
      status: "ACTIVE",
      notes: "",
      balance: "",
      ratePerKm: "",
      ratePerHour: "",
      minimumFare: "",
      commissionRate: "",
      paymentTerms: "",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      taxId: "",
    },
  });

  // Fetch partner details
  const fetchPartnerDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch partner details");
      }

      const data = await response.json();
      setPartner(data);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Failed to load partner details");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch partner vehicles
  const fetchPartnerVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles`);
      if (!response.ok) {
        throw new Error("Failed to fetch partner vehicles");
      }

      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching partner vehicles:", error);
      toast.error("Failed to load partner vehicles");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails();
      fetchPartnerVehicles();
    }
  }, [partnerId]);

  // Handle add vehicle
  const handleAddVehicle = () => {
    setCurrentVehicleId(null);
    setIsEditingVehicle(false);
    setShowVehicleDialog(true);
  };

  // Handle edit vehicle
  const handleEditVehicle = async (vehicleId: string) => {
    setCurrentVehicleId(vehicleId);
    setIsEditingVehicle(true);
    setIsSubmitting(true);
    setShowVehicleDialog(true);

    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details");
      }

      const vehicleData = await response.json();

      // Convert numeric values to strings for the form
      const formData = {
        ...vehicleData,
        year: vehicleData.year.toString(),
        capacity: vehicleData.capacity.toString(),
        lastMaintenance: vehicleData.lastMaintenance || "",
      };

      vehicleForm.reset(formData);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to load vehicle details");
      setShowVehicleDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      const response = await fetch(`/api/partners/${partnerId}/vehicles/${vehicleToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete vehicle");
      }

      toast.success(`Vehicle ${vehicleToDelete.make} ${vehicleToDelete.model} deleted successfully`);
      setShowDeleteVehicleDialog(false);
      setVehicleToDelete(null);
      fetchPartnerVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete vehicle");
    }
  };

  // Confirm delete vehicle
  const confirmDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteVehicleDialog(true);
  };

  // Handle edit partner
  const handleEditPartner = () => {
    if (!partner) return;

    // Convert numeric values to strings for the form
    const formData = {
      ...partner,
      balance: partner.balance?.toString() || "",
      ratePerKm: partner.ratePerKm?.toString() || "",
      ratePerHour: partner.ratePerHour?.toString() || "",
      minimumFare: partner.minimumFare?.toString() || "",
      commissionRate: partner.commissionRate?.toString() || "",
    };

    form.reset(formData);
    setShowPartnerDialog(true);
  };

  // Initialize vehicle form with react-hook-form and zod validation
  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      licensePlate: "",
      isForeignPlate: false,
      color: "",
      capacity: "4",
      vehicleType: "SEDAN",
      status: "AVAILABLE",
      lastMaintenance: "",
    },
  });

  // Handle vehicle form submission
  const handleSubmitVehicle = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditingVehicle && currentVehicleId
        ? `/api/partners/${partnerId}/vehicles/${currentVehicleId}`
        : `/api/partners/${partnerId}/vehicles`;

      const method = isEditingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save vehicle");
      }

      const savedVehicle = await response.json();

      toast.success(
        isEditingVehicle
          ? `Vehicle ${savedVehicle.make} ${savedVehicle.model} updated successfully`
          : `Vehicle ${savedVehicle.make} ${savedVehicle.model} added successfully`
      );

      setShowVehicleDialog(false);
      fetchPartnerVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle partner form submission
  const handleSubmitPartner = async (data: PartnerFormValues) => {
    setIsSubmitting(true);
    try {
      // Note: For existing partners, we still collect all the data
      // The partnerId will be used later by a webhook to fetch additional data

      // Otherwise proceed with normal update
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update partner");
      }

      const updatedPartner = await response.json();
      setPartner(updatedPartner);
      toast.success(`Partner "${updatedPartner.name}" updated successfully`);
      setShowPartnerDialog(false);
    } catch (error) {
      console.error("Error updating partner:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update partner");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get partner type badge
  const getPartnerTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return <Badge variant="default">Internal</Badge>;
      case "EXTERNAL":
        return <Badge variant="outline">External</Badge>;
      case "AFFILIATE":
        return <Badge variant="secondary">Affiliate</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get partner status badge
  const getPartnerStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
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
                <div className="flex items-center mb-4">
                  <Button variant="ghost" size="sm" asChild className="mr-2">
                    <Link href="/partners">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Partners
                    </Link>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center space-x-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <div>Loading partner details...</div>
                  </div>
                ) : partner ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        {partner.logoUrl ? (
                          <AvatarImage src={partner.logoUrl} alt={partner.name} />
                        ) : null}
                        <AvatarFallback className="text-lg">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h1 className="text-2xl font-bold tracking-tight">
                            {partner.name}
                          </h1>
                          {getPartnerTypeBadge(partner.type)}
                          {getPartnerStatusBadge(partner.status)}
                        </div>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <Building2 className="mr-1 h-4 w-4" />
                          <span>Partner since {formatDate(partner.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleEditPartner} className="mt-4 md:mt-0">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Partner
                    </Button>
                  </div>
                ) : (
                  <div>Partner not found</div>
                )}
              </div>

              {!isLoading && partner && (
                <>
                  {/* Partner Information */}
                  <div className="px-4 lg:px-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Partner Information</CardTitle>
                        <CardDescription>
                          Contact and business details for {partner.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <Mail className="inline-block mr-1 h-4 w-4" />
                              Email
                            </div>
                            <div>{partner.email}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <Phone className="inline-block mr-1 h-4 w-4" />
                              Phone
                            </div>
                            <div>{partner.phone || "Not provided"}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <MapPin className="inline-block mr-1 h-4 w-4" />
                              Address
                            </div>
                            <div>
                              {partner.address ? (
                                <>
                                  {partner.address}
                                  <br />
                                  {partner.city && partner.postalCode
                                    ? `${partner.city}, ${partner.postalCode}`
                                    : partner.city || partner.postalCode}
                                  <br />
                                  {partner.country}
                                </>
                              ) : (
                                "Not provided"
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <ExternalLink className="inline-block mr-1 h-4 w-4" />
                              Website
                            </div>
                            <div>
                              {partner.website ? (
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {partner.website}
                                </a>
                              ) : (
                                "Not provided"
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <DollarSign className="inline-block mr-1 h-4 w-4" />
                              Balance
                            </div>
                            <div>
                              {typeof partner.balance === "number"
                                ? `$${partner.balance.toFixed(2)}`
                                : "$0.00"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              <Calendar className="inline-block mr-1 h-4 w-4" />
                              Last Updated
                            </div>
                            <div>{formatDate(partner.updatedAt)}</div>
                          </div>
                        </div>

                        {partner.notes && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              <FileText className="inline-block mr-1 h-4 w-4" />
                              Notes
                            </div>
                            <div className="rounded-md bg-muted p-3">
                              {partner.notes}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs for related data */}
                  <div className="px-4 lg:px-6">
                    <Tabs defaultValue="events">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="vehicles">
                          Vehicles ({vehicles.length})
                        </TabsTrigger>
                        <TabsTrigger value="events">
                          Events ({partner._count.eventParticipations})
                        </TabsTrigger>
                        <TabsTrigger value="missions">
                          Missions ({partner._count.missionPartners})
                        </TabsTrigger>
                        <TabsTrigger value="rides">
                          Rides ({partner._count.ridePartners})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="vehicles" className="mt-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Vehicles</CardTitle>
                              <CardDescription>
                                Vehicles owned or operated by this partner
                              </CardDescription>
                            </div>
                            <Button onClick={handleAddVehicle}>
                              <PlusIcon className="mr-2 h-4 w-4" />
                              Add Vehicle
                            </Button>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Vehicle</TableHead>
                                  <TableHead>License Plate</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {isLoadingVehicles ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                      <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading vehicles...
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ) : vehicles.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                      No vehicles found for this partner.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  vehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <Car className="h-5 w-5" />
                                          </div>
                                          <div>
                                            <div className="font-medium">
                                              {vehicle.make} {vehicle.model}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {vehicle.year} • {vehicle.color || "No color"}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="font-medium">
                                          {vehicle.licensePlate}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {vehicle.isForeignPlate ? "Non-French plate" : "French plate"}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {vehicle.vehicleType.charAt(0) + vehicle.vehicleType.slice(1).toLowerCase()}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {vehicle.status === "AVAILABLE" ? (
                                          <Badge variant="success">Available</Badge>
                                        ) : vehicle.status === "IN_USE" ? (
                                          <Badge variant="default">In Use</Badge>
                                        ) : vehicle.status === "MAINTENANCE" ? (
                                          <Badge variant="warning">Maintenance</Badge>
                                        ) : (
                                          <Badge variant="destructive">Out of Service</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreHorizontalIcon className="h-4 w-4" />
                                              <span className="sr-only">Actions</span>
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem
                                              onClick={() => handleEditVehicle(vehicle.id)}
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-destructive focus:text-destructive"
                                              onClick={() => confirmDeleteVehicle(vehicle)}
                                            >
                                              <TrashIcon className="mr-2 h-4 w-4" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="events" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Events</CardTitle>
                            <CardDescription>
                              Events that this partner is participating in
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Event</TableHead>
                                  <TableHead>Dates</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Fee</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {partner.eventParticipations.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="h-24 text-center"
                                    >
                                      No events found for this partner.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  partner.eventParticipations.map((participation) => (
                                    <TableRow key={participation.id}>
                                      <TableCell>
                                        <Link
                                          href={`/events/${participation.eventId}`}
                                          className="font-medium hover:underline"
                                        >
                                          {participation.event.title}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(participation.event.startDate)} -{" "}
                                        {formatDate(participation.event.endDate)}
                                      </TableCell>
                                      <TableCell>
                                        {participation.role.replace(/_/g, " ")}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {participation.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {participation.fee
                                          ? `$${participation.fee.toFixed(2)}`
                                          : "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                          {partner._count.eventParticipations > 5 && (
                            <CardFooter className="flex justify-center p-4">
                              <Button variant="outline" size="sm">
                                View All Events
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      </TabsContent>

                      <TabsContent value="missions" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Missions</CardTitle>
                            <CardDescription>
                              Missions that this partner is assigned to
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Mission</TableHead>
                                  <TableHead>Dates</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Fee</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {partner.missionPartners.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="h-24 text-center"
                                    >
                                      No missions found for this partner.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  partner.missionPartners.map((missionPartner) => (
                                    <TableRow key={missionPartner.id}>
                                      <TableCell>
                                        <Link
                                          href={`/missions/${missionPartner.missionId}`}
                                          className="font-medium hover:underline"
                                        >
                                          {missionPartner.mission.title}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        {formatDate(missionPartner.mission.startDate)} -{" "}
                                        {formatDate(missionPartner.mission.endDate)}
                                      </TableCell>
                                      <TableCell>
                                        {missionPartner.role.replace(/_/g, " ")}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {missionPartner.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {missionPartner.fee
                                          ? `$${missionPartner.fee.toFixed(2)}`
                                          : "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                          {partner._count.missionPartners > 5 && (
                            <CardFooter className="flex justify-center p-4">
                              <Button variant="outline" size="sm">
                                View All Missions
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      </TabsContent>

                      <TabsContent value="rides" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Rides</CardTitle>
                            <CardDescription>
                              Rides that this partner is assigned to
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Ride Number</TableHead>
                                  <TableHead>Pickup</TableHead>
                                  <TableHead>Dropoff</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Fee</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {partner.ridePartners.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="h-24 text-center"
                                    >
                                      No rides found for this partner.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  partner.ridePartners.map((ridePartner) => (
                                    <TableRow key={ridePartner.id}>
                                      <TableCell>
                                        <Link
                                          href={`/rides/${ridePartner.rideId}`}
                                          className="font-medium hover:underline"
                                        >
                                          {ridePartner.ride.rideNumber}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        <div className="max-w-[200px] truncate">
                                          {ridePartner.ride.pickupAddress}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {formatDate(ridePartner.ride.pickupTime)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="max-w-[200px] truncate">
                                          {ridePartner.ride.dropoffAddress}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {ridePartner.ride.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {ridePartner.fee
                                          ? `$${ridePartner.fee.toFixed(2)}`
                                          : "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                          {partner._count.ridePartners > 5 && (
                            <CardFooter className="flex justify-center p-4">
                              <Button variant="outline" size="sm">
                                View All Rides
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Financial Information */}
                  <div className="px-4 lg:px-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Information</CardTitle>
                        <CardDescription>
                          Rates, fees, and payment details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              Rate per Kilometer
                            </div>
                            <div>
                              {partner.ratePerKm
                                ? `$${partner.ratePerKm.toFixed(2)}`
                                : "Not set"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              Rate per Hour
                            </div>
                            <div>
                              {partner.ratePerHour
                                ? `$${partner.ratePerHour.toFixed(2)}`
                                : "Not set"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              Minimum Fare
                            </div>
                            <div>
                              {partner.minimumFare
                                ? `$${partner.minimumFare.toFixed(2)}`
                                : "Not set"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              Commission Rate
                            </div>
                            <div>
                              {partner.commissionRate
                                ? `${partner.commissionRate.toFixed(2)}%`
                                : "Not set"}
                            </div>
                          </div>
                        </div>

                        {partner.paymentTerms && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              Payment Terms
                            </div>
                            <div className="rounded-md bg-muted p-3">
                              {partner.paymentTerms}
                            </div>
                          </div>
                        )}

                        {/* Banking Information */}
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">
                            Banking Information
                          </h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">
                                Bank Name
                              </div>
                              <div>{partner.bankName || "Not provided"}</div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">
                                Account Number
                              </div>
                              <div>
                                {partner.bankAccountNumber
                                  ? `•••• ${partner.bankAccountNumber.slice(-4)}`
                                  : "Not provided"}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">
                                Routing Number
                              </div>
                              <div>
                                {partner.bankRoutingNumber
                                  ? `•••• ${partner.bankRoutingNumber.slice(-4)}`
                                  : "Not provided"}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">
                                Tax ID
                              </div>
                              <div>{partner.taxId || "Not provided"}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Partner Dialog */}
      <PartnerDialog
        open={showPartnerDialog}
        onOpenChange={setShowPartnerDialog}
        onSubmit={handleSubmitPartner}
        defaultValues={form.getValues()}
        isSubmitting={isSubmitting}
        isEditMode={true}
      />

      {/* Vehicle Dialog */}
      <VehicleDialog
        open={showVehicleDialog}
        onOpenChange={setShowVehicleDialog}
        onSubmit={handleSubmitVehicle}
        defaultValues={vehicleForm.getValues()}
        isSubmitting={isSubmitting}
        isEditMode={isEditingVehicle}
        partnerId={partnerId as string}
      />

      {/* Delete Vehicle Confirmation Dialog */}
      <AlertDialog open={showDeleteVehicleDialog} onOpenChange={setShowDeleteVehicleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
