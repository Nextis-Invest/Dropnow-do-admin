"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  Search as SearchIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  Car as CarIcon,
  Loader2,
  Eye,
  MoreHorizontal,
  Users,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RideForm } from "../../components/forms/ride-form/RideForm";
import { RidesList, Ride } from "@/components/rides/rides-list";

export default function RidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rideDialogOpen, setRideDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<Ride[]>([]);
  const [users, setUsers] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [events, setEvents] = useState([]);
  const debouncedSearchQuery = useDebounce(searchTerm, 500); // 500ms debounce delay

  // Fetch rides from the API
  useEffect(() => {
    const fetchRides = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/rides${
            debouncedSearchQuery ? `?search=${debouncedSearchQuery}` : ""
          }`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch rides");
        }
        const data = await response.json();
        setRides(data);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, [debouncedSearchQuery]);

  // Fetch form data (users, chauffeurs, clients, events)
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch("/api/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        // Fetch chauffeurs
        const chauffeursResponse = await fetch("/api/chauffeurs");
        if (chauffeursResponse.ok) {
          const chauffeursData = await chauffeursResponse.json();
          setChauffeurs(chauffeursData);
        }

        // Fetch clients
        const clientsResponse = await fetch("/api/clients");
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData);
        }

        // Fetch events
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchFormData();
  }, []);

  // Use the fetched rides
  const filteredRides = rides;

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "CITY_TRANSFER":
        return "City Transfer";
      case "AIRPORT_TRANSFER":
        return "Airport Transfer";
      case "TRAIN_STATION_TRANSFER":
        return "Train Station Transfer";
      case "BOOK_BY_HOUR":
        return "Book by Hour";
      default:
        return category;
    }
  };

  // Handle ride creation
  const handleCreateRide = async (data: any) => {
    console.log("Ride created:", data);

    try {
      // Close the appropriate dialog based on whether it's a mission or not
      if (data.isMission) {
        setMissionDialogOpen(false);
      } else {
        setRideDialogOpen(false);
      }

      setIsLoading(true);

      // The ride has already been created by the RideForm component
      // We just need to refresh the rides list
      const response = await fetch("/api/rides");
      if (!response.ok) {
        throw new Error("Failed to fetch rides");
      }
      const updatedRides = await response.json();
      setRides(updatedRides);

      // Show success message
      alert("Ride created successfully!");
    } catch (error: any) {
      console.error("Error refreshing rides:", error);
      alert(error.message || "Failed to refresh rides.");
    } finally {
      setIsLoading(false);
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
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rides</h1>
                    <p className="text-muted-foreground">
                      Manage all your rides and transportation services
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog
                      open={rideDialogOpen}
                      onOpenChange={setRideDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button onClick={() => setRideDialogOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          New Ride
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto md:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>Create New Ride</DialogTitle>
                          <DialogDescription>
                            Fill in the details to create a new ride.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <RideForm
                            onAddRide={handleCreateRide}
                            users={users}
                            chauffeurs={chauffeurs}
                            clients={clients}
                            partners={[]}
                            projects={events}
                            existingMissions={[]}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={missionDialogOpen}
                      onOpenChange={setMissionDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setMissionDialogOpen(true)}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Create Mission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto md:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>Create New Mission</DialogTitle>
                          <DialogDescription>
                            Create a mission for a chauffeur with multiple
                            rides.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <RideForm
                            onAddRide={handleCreateRide}
                            users={users}
                            chauffeurs={chauffeurs}
                            clients={clients}
                            partners={[]}
                            projects={events}
                            existingMissions={[]}
                            defaultValues={{ isMission: true }}
                            buttonText="Create Mission"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
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
                        placeholder="Search rides..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>
              </div>

              {/* Rides List with Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                      {filteredRides.length} rides found
                    </div>
                  </div>

                  {/* Table View */}
                  <TabsContent value="table" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ride #</TableHead>
                            <TableHead>Passenger</TableHead>
                            <TableHead>Pickup</TableHead>
                            <TableHead>Dropoff</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="h-24 text-center"
                              >
                                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              </TableCell>
                            </TableRow>
                          ) : filteredRides.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="h-24 text-center"
                              >
                                No rides found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRides.map((ride) => (
                              <TableRow key={ride.id}>
                                <TableCell className="font-medium">
                                  {ride.rideNumber}
                                </TableCell>
                                <TableCell>{ride.passengerName}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  <div className="flex items-center">
                                    <MapPinIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                                    <span className="truncate">
                                      {ride.pickupAddress}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <ClockIcon className="mr-1 h-3 w-3" />
                                    <span>
                                      {new Date(
                                        ride.pickupTime
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  <span className="truncate">
                                    {ride.dropoffAddress}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 text-xs"
                                  >
                                    {getCategoryDisplayName(
                                      ride.rideType || ride.category || ""
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${getStatusColor(
                                      ride.status
                                    )} px-1.5 text-xs`}
                                  >
                                    {ride.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                      <a href={`/rides/${ride.id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                      </a>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Grid View */}
                  <TabsContent value="grid" className="space-y-4">
                    <RidesList
                      rides={filteredRides}
                      title=""
                      description=""
                      showSearch={false}
                    />
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
