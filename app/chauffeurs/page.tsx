"use client";

import { useState, useEffect } from "react";
import type {
  Chauffeur,
  ChauffeurFormValues,
} from "@/components/forms/chauffeur-form/types";
import { ChauffeurCategory } from "@/components/forms/chauffeur-form/types";
import { ChauffeurDialog } from "@/components/forms/chauffeur-form/chauffeur-dialog";
import {
  PlusIcon,
  Loader2,
  SearchIcon,
  Car,
  Calendar,
  User,
  Phone,
  MoreHorizontal,
  Eye,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { ExternalUserConnectionQR } from "../external-users/components/external-user-connection-qr";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

export default function ChauffeursPage() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [externalUsers, setExternalUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExternalUsers, setIsLoadingExternalUsers] = useState(true);
  const [chauffeurDialogOpen, setChauffeurDialogOpen] = useState(false);
  const [externalUserDialogOpen, setExternalUserDialogOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce delay

  // Fetch chauffeurs from the API
  useEffect(() => {
    const fetchChauffeurs = async () => {
      try {
        setIsLoading(true);
        let url = "/api/chauffeurs";

        // Add filter if selected
        if (filterStatus) {
          url += `?status=${filterStatus}`;
        }

        // For now, use mock data since the API might not be fully implemented
        // In a real implementation, you would fetch from the API
        const mockChauffeurs: Chauffeur[] = [
          {
            id: "chauffeur_1",
            userId: "user_1",
            firstName: "John",
            lastName: "Doe",
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            licenseNumber: "DL12345678",
            licenseExpiry: new Date("2025-12-31"),
            vtcCardNumber: "VTC2023001",
            vtcValidationDate: new Date("2023-05-15"),
            status: "AVAILABLE",
            category: ChauffeurCategory.HIGH_END,
            vehicle: {
              id: "vehicle_1",
              name: "Mercedes S-Class",
              licensePlate: "ABC123",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "chauffeur_2",
            userId: "user_2",
            firstName: "Jane",
            lastName: "Smith",
            fullName: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "+0987654321",
            licenseNumber: "DL87654321",
            licenseExpiry: new Date("2024-10-15"),
            vtcCardNumber: "VTC2023002",
            vtcValidationDate: new Date("2023-08-22"),
            status: "BUSY",
            category: ChauffeurCategory.BUSINESS,
            vehicle: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "chauffeur_3",
            userId: "user_3",
            firstName: "Michael",
            lastName: "Johnson",
            fullName: "Michael Johnson",
            email: "michael.johnson@example.com",
            phone: "+1122334455",
            licenseNumber: "DL11223344",
            licenseExpiry: new Date("2026-05-20"),
            vtcCardNumber: "VTC2023003",
            vtcValidationDate: new Date("2023-11-10"),
            status: "ON_BREAK",
            category: ChauffeurCategory.ECONOMY,
            vehicle: {
              id: "vehicle_2",
              name: "BMW 7 Series",
              licensePlate: "XYZ789",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Filter chauffeurs based on status if selected
        let filteredData = filterStatus
          ? mockChauffeurs.filter(
              (chauffeur) => chauffeur.status === filterStatus
            )
          : mockChauffeurs;

        // Filter chauffeurs based on search query if provided
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredData = filteredData.filter(
            (chauffeur: Chauffeur) =>
              chauffeur.firstName.toLowerCase().includes(query) ||
              chauffeur.lastName.toLowerCase().includes(query) ||
              chauffeur.email.toLowerCase().includes(query) ||
              chauffeur.licenseNumber.toLowerCase().includes(query) ||
              (chauffeur.phone && chauffeur.phone.toLowerCase().includes(query))
          );
        }

        setChauffeurs(filteredData);
      } catch (error) {
        console.error("Error fetching chauffeurs:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load chauffeurs"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChauffeurs();
  }, [filterStatus, debouncedSearchQuery]);

  // Fetch external users from the API
  useEffect(() => {
    const fetchExternalUsers = async () => {
      try {
        setIsLoadingExternalUsers(true);
        const response = await fetch("/api/external-users");
        if (response.ok) {
          const data = await response.json();
          setExternalUsers(data);
        } else {
          throw new Error("Failed to fetch external users");
        }
      } catch (error) {
        console.error("Error fetching external users:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load external users"
        );
      } finally {
        setIsLoadingExternalUsers(false);
      }
    };

    fetchExternalUsers();
  }, []);

  // Log selected chauffeur when it changes
  useEffect(() => {
    if (selectedChauffeur) {
      console.log("Selected chauffeur for editing:", selectedChauffeur);
    }
  }, [selectedChauffeur]);

  // Handle chauffeur creation/update
  const handleChauffeurSubmit = async (data: ChauffeurFormValues) => {
    try {
      // For now, simulate API call with mock data
      // In a real implementation, you would call the API

      // Simulate a delay to mimic API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedChauffeur) {
        // Update existing chauffeur in the state
        setChauffeurs((prevChauffeurs) =>
          prevChauffeurs.map((chauffeur) =>
            chauffeur.id === selectedChauffeur.id
              ? {
                  ...chauffeur,
                  licenseNumber: data.licenseNumber,
                  licenseExpiry: data.licenseExpiry,
                  vtcCardNumber: data.vtcCardNumber,
                  vtcValidationDate: data.vtcValidationDate,
                  status: data.status,
                  category: data.category,
                  notes: data.notes,
                  vehicle: data.vehicleId
                    ? {
                        id: data.vehicleId,
                        name:
                          data.vehicleId === "vehicle_1"
                            ? "Mercedes S-Class"
                            : "BMW 7 Series",
                        licensePlate:
                          data.vehicleId === "vehicle_1" ? "ABC123" : "XYZ789",
                      }
                    : null,
                  updatedAt: new Date(),
                }
              : chauffeur
          )
        );
        toast.success("Chauffeur updated successfully");
      } else {
        // Create a new chauffeur and add it to the state
        const newChauffeur: Chauffeur = {
          id: `chauffeur_${Date.now()}`,
          userId: data.userId,
          firstName:
            data.userId === "user_1"
              ? "John"
              : data.userId === "user_2"
              ? "Jane"
              : "Michael",
          lastName:
            data.userId === "user_1"
              ? "Doe"
              : data.userId === "user_2"
              ? "Smith"
              : "Johnson",
          fullName:
            data.userId === "user_1"
              ? "John Doe"
              : data.userId === "user_2"
              ? "Jane Smith"
              : "Michael Johnson",
          email:
            data.userId === "user_1"
              ? "john.doe@example.com"
              : data.userId === "user_2"
              ? "jane.smith@example.com"
              : "michael.johnson@example.com",
          phone:
            data.userId === "user_1"
              ? "+1234567890"
              : data.userId === "user_2"
              ? "+0987654321"
              : "+1122334455",
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          vtcCardNumber: data.vtcCardNumber,
          vtcValidationDate: data.vtcValidationDate,
          status: data.status,
          category: data.category,
          notes: data.notes,
          vehicle: data.vehicleId
            ? {
                id: data.vehicleId,
                name:
                  data.vehicleId === "vehicle_1"
                    ? "Mercedes S-Class"
                    : "BMW 7 Series",
                licensePlate:
                  data.vehicleId === "vehicle_1" ? "ABC123" : "XYZ789",
              }
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setChauffeurs((prevChauffeurs) => [...prevChauffeurs, newChauffeur]);
        toast.success("Chauffeur created successfully");
      }

      setChauffeurDialogOpen(false);
      setSelectedChauffeur(null);
    } catch (error) {
      console.error("Error saving chauffeur:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Handle chauffeur deletion
  const handleDeleteChauffeur = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chauffeur?")) {
      return;
    }
    try {
      // For now, simulate API call with mock data
      // In a real implementation, you would call the API

      // Simulate a delay to mimic API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove the chauffeur from the state
      setChauffeurs(chauffeurs.filter((chauffeur) => chauffeur.id !== id));

      toast.success("Chauffeur deleted successfully");
    } catch (error) {
      console.error("Error deleting chauffeur:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "BUSY":
        return "bg-red-100 text-red-800";
      case "ON_BREAK":
        return "bg-yellow-100 text-yellow-800";
      case "OFF_DUTY":
        return "bg-gray-100 text-gray-800";
      case "ON_LEAVE":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get category badge color
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "HIGH_END":
        return "bg-purple-100 text-purple-800";
      case "BUSINESS":
        return "bg-blue-100 text-blue-800";
      case "ECONOMY":
        return "bg-green-100 text-green-800";
      case "AVERAGE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace("_", " ");
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Chauffeurs
                    </h1>
                    <p className="text-muted-foreground">
                      Manage all your external drivers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setExternalUserDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Chauffeur
                    </Button>
                    <Dialog
                      open={externalUserDialogOpen}
                      onOpenChange={setExternalUserDialogOpen}
                    >
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Add Chauffeur</DialogTitle>
                          <DialogDescription>
                            Create a connection for a chauffeur and generate a
                            QR code for ride access.
                          </DialogDescription>
                        </DialogHeader>
                        <ExternalUserConnectionQR />
                      </DialogContent>
                    </Dialog>
                    <ChauffeurDialog
                      open={chauffeurDialogOpen}
                      onOpenChange={setChauffeurDialogOpen}
                      onSubmit={handleChauffeurSubmit}
                      defaultValues={selectedChauffeur || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <form
                      className="flex w-full max-w-sm items-center space-x-2"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <Input
                        placeholder="Search chauffeurs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <SearchIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Search</span>
                      </Button>
                    </form>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilterStatus("AVAILABLE")}
                        >
                          Available
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilterStatus("BUSY")}
                        >
                          Busy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilterStatus("ON_BREAK")}
                        >
                          On Break
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilterStatus("OFF_DUTY")}
                        >
                          Off Duty
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFilterStatus("ON_LEAVE")}
                        >
                          On Leave
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {externalUsers.length} chauffeurs found
                    </div>
                  </div>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoadingExternalUsers ? (
                        <div className="col-span-full text-center py-12">
                          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground/50 animate-spin mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            Loading Chauffeurs
                          </h3>
                          <p className="text-muted-foreground">
                            Please wait while we fetch the data...
                          </p>
                        </div>
                      ) : externalUsers.length > 0 ? (
                        externalUsers.map((user) => (
                          <Card key={user.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : `External User ${user.externalId}`}
                              </CardTitle>
                              <CardDescription>
                                {user.email || "No email provided"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    External ID:
                                  </span>
                                  <span className="text-sm">
                                    {user.externalId}
                                  </span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      Phone:
                                    </span>
                                    <span className="text-sm">
                                      {user.phone}
                                    </span>
                                  </div>
                                )}
                                {user.lastConnected && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      Last Connected:
                                    </span>
                                    <span className="text-sm">
                                      {formatDistanceToNow(user.lastConnected, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>
                                )}
                                {user.mobileDevices &&
                                  user.mobileDevices.length > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">
                                        Device:
                                      </span>
                                      <span className="text-sm">
                                        {user.mobileDevices[0].deviceName ||
                                          user.mobileDevices[0].deviceModel ||
                                          "Unknown device"}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm">
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Generate QR
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Generate QR Code</DialogTitle>
                                    <DialogDescription>
                                      Generate a new QR code for this external
                                      user.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ExternalUserConnectionQR
                                    initialExternalId={user.externalId}
                                  />
                                </DialogContent>
                              </Dialog>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <QrCode className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No Chauffeurs Yet
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Create your first chauffeur connection to get
                            started.
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Chauffeur
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Add Chauffeur</DialogTitle>
                                <DialogDescription>
                                  Create a connection for a chauffeur and
                                  generate a QR code for ride access.
                                </DialogDescription>
                              </DialogHeader>
                              <ExternalUserConnectionQR />
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
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
