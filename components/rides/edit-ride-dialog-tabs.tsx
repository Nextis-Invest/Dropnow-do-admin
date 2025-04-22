"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateTimePicker } from "@/components/forms/ride-form/form-helpers/DateTimePicker";
import { AddressAutocomplete } from "@/components/forms/ride-form/form-helpers/AddressAutocomplete";
import {
  RIDE_STATUSES,
  RIDE_CATEGORIES,
  AIRPORT_TRANSFER_SUBTYPES,
} from "@/components/forms/ride-form/constants";
import { Loader2, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the schema for the edit form
const editRideSchema = z.object({
  // Basic Info Tab
  rideType: z.enum(RIDE_CATEGORIES),
  airportTransferType: z.enum(AIRPORT_TRANSFER_SUBTYPES).optional(),
  status: z.string().min(1, "Status is required"),
  fare: z.number().optional(),

  // Locations Tab
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  dropoffTime: z.date().optional(),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),
  dropoffLatitude: z.number().optional(),
  dropoffLongitude: z.number().optional(),

  // Passenger Tab
  passengerId: z.string().optional(),
  passengerFirstName: z.string().optional(),
  passengerLastName: z.string().optional(),
  passengerEmail: z.string().email().optional(),
  passengerPhone: z.string().optional(),
  passengerCount: z.number().min(1).default(1),

  // Driver Tab
  chauffeurId: z.string().optional(),

  // Flight Info Tab
  flightNumber: z.string().optional(),

  // Notes Tab
  notes: z.string().optional(),

  // Hidden fields
  clientId: z.string().optional(),
  eventId: z.string().optional(),
  bookingId: z.string().optional(),
});

type EditRideFormValues = z.infer<typeof editRideSchema>;

interface EditRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rideData: any; // Replace with proper type
  onRideUpdated: () => void;
}

export function EditRideDialogTabs({
  open,
  onOpenChange,
  rideData,
  onRideUpdated,
}: EditRideDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [filteredChauffeurs, setFilteredChauffeurs] = useState<any[]>([]);
  const [isLoadingChauffeurs, setIsLoadingChauffeurs] = useState(false);
  const [chauffeurSearchTerm, setChauffeurSearchTerm] = useState("");
  const [openChauffeurPopover, setOpenChauffeurPopover] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic-info");

  // Initialize form with ride data
  const form = useForm<EditRideFormValues>({
    resolver: zodResolver(editRideSchema),
    defaultValues: {
      rideType: rideData?.rideType || "CITY_TRANSFER",
      airportTransferType: rideData?.airportTransferType || undefined,
      status: rideData?.status || "SCHEDULED",
      fare: rideData?.fare || 0,
      pickupAddress: rideData?.pickupAddress || "",
      dropoffAddress: rideData?.dropoffAddress || "",
      pickupTime: rideData?.pickupTime
        ? new Date(rideData.pickupTime)
        : new Date(),
      dropoffTime: rideData?.dropoffTime
        ? new Date(rideData.dropoffTime)
        : undefined,
      pickupLatitude: rideData?.pickupLatitude,
      pickupLongitude: rideData?.pickupLongitude,
      dropoffLatitude: rideData?.dropoffLatitude,
      dropoffLongitude: rideData?.dropoffLongitude,
      passengerId: rideData?.passengerId || "",
      // Use passenger info from the passenger object if available, otherwise use direct fields
      passengerFirstName:
        rideData?.passenger?.firstName || rideData?.passengerFirstName || "",
      passengerLastName:
        rideData?.passenger?.lastName || rideData?.passengerLastName || "",
      passengerEmail:
        rideData?.passenger?.email || rideData?.passengerEmail || "",
      passengerPhone:
        rideData?.passenger?.phone || rideData?.passengerPhone || "",
      passengerCount: rideData?.passengerCount || 1,
      chauffeurId: rideData?.chauffeurId || "",
      flightNumber: rideData?.flightNumber || "",
      notes: rideData?.notes || "",
      clientId: rideData?.booking?.clientId || "",
      eventId: rideData?.mission?.eventId || "",
      bookingId: rideData?.bookingId || "",
    },
  });

  // Debug log for passenger data
  useEffect(() => {
    if (rideData) {
      console.log("Ride data passenger info:", {
        passenger: rideData.passenger,
        passengerFirstName: rideData.passengerFirstName,
        passengerLastName: rideData.passengerLastName,
        passengerEmail: rideData.passengerEmail,
        passengerPhone: rideData.passengerPhone,
      });
    }
  }, [rideData]);

  // Fetch chauffeurs when dialog opens
  useEffect(() => {
    if (open) {
      fetchChauffeurs();

      // Set selected chauffeur if exists
      if (rideData?.chauffeur) {
        console.log("Chauffeur from ride data:", rideData.chauffeur);
        setSelectedChauffeur(rideData.chauffeur);
      } else if (rideData?.chauffeurId) {
        // If we have chauffeurId but no chauffeur object, we'll find it after fetching
        console.log("Chauffeur ID from ride data:", rideData.chauffeurId);
      }
    }
  }, [open, rideData]);

  // Debug log for chauffeurs
  useEffect(() => {
    if (chauffeurs.length > 0) {
      console.log("Loaded chauffeurs:", chauffeurs);

      // If we have a chauffeurId but no selectedChauffeur, find the chauffeur in the data
      if (rideData?.chauffeurId && !selectedChauffeur) {
        const foundChauffeur = chauffeurs.find(
          (c: any) => c.id === rideData.chauffeurId
        );
        if (foundChauffeur) {
          console.log("Found chauffeur by ID after loading:", foundChauffeur);
          setSelectedChauffeur(foundChauffeur);
        }
      }
    }
  }, [chauffeurs, rideData, selectedChauffeur]);

  // Filter chauffeurs based on search term
  useEffect(() => {
    if (chauffeurs.length > 0) {
      const filtered = chauffeurs.filter((chauffeur) => {
        const fullName =
          `${chauffeur.firstName} ${chauffeur.lastName}`.toLowerCase();
        return fullName.includes(chauffeurSearchTerm.toLowerCase());
      });
      setFilteredChauffeurs(filtered);
    }
  }, [chauffeurSearchTerm, chauffeurs]);

  // Fetch chauffeurs (external users) from API
  const fetchChauffeurs = async () => {
    setIsLoadingChauffeurs(true);
    try {
      // Use the external-users API endpoint instead of chauffeurs
      const response = await fetch("/api/external-users");
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();
      console.log("Fetched external users (drivers):", data);
      setChauffeurs(data);
      setFilteredChauffeurs(data);

      // If we have a chauffeurId but no selectedChauffeur, find the chauffeur in the data
      const chauffeurId = form.getValues("chauffeurId");
      if (chauffeurId && !selectedChauffeur) {
        const foundChauffeur = data.find((c: any) => c.id === chauffeurId);
        if (foundChauffeur) {
          console.log("Found driver by ID:", foundChauffeur);
          setSelectedChauffeur(foundChauffeur);
        }
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setIsLoadingChauffeurs(false);
    }
  };

  // Format chauffeur name for display
  const formatChauffeurName = (chauffeur: any) => {
    return `${chauffeur.firstName} ${chauffeur.lastName}`;
  };

  // Handle form submission
  const onSubmit = async (data: EditRideFormValues) => {
    setIsSubmitting(true);
    try {
      // Format the data for the API
      const formattedData = {
        ...data,
        // Format passenger data as expected by the API
        passenger: {
          firstName: data.passengerFirstName,
          lastName: data.passengerLastName,
          email: data.passengerEmail,
          phone: data.passengerPhone,
        },
      };

      console.log("Submitting ride data:", formattedData);

      const response = await fetch(`/api/rides/${rideData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update ride");
      }

      toast.success("Ride updated successfully");
      onOpenChange(false);
      onRideUpdated();
    } catch (error) {
      console.error("Error updating ride:", error);
      toast.error("Failed to update ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ride {rideData?.rideNumber}</DialogTitle>
          <DialogDescription>
            Update the details of this ride. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="passenger">Passenger</TabsTrigger>
                <TabsTrigger value="driver">Driver</TabsTrigger>
                <TabsTrigger value="flight">Flight Info</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic-info" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="rideType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ride Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ride type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RIDE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("rideType") === "AIRPORT_TRANSFER" && (
                  <FormField
                    control={form.control}
                    name="airportTransferType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Airport Transfer Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transfer type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AIRPORT_TRANSFER_SUBTYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RIDE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fare</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          defaultValue={field.value}
                          onAddressSelect={(address, lat, lng) => {
                            form.setValue("pickupAddress", address);
                            form.setValue("pickupLatitude", lat);
                            form.setValue("pickupLongitude", lng);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          defaultValue={field.value}
                          onAddressSelect={(address, lat, lng) => {
                            form.setValue("dropoffAddress", address);
                            form.setValue("dropoffLatitude", lat);
                            form.setValue("dropoffLongitude", lng);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <DateTimePicker
                      label="Pickup Time"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffTime"
                  render={({ field }) => (
                    <DateTimePicker
                      label="Dropoff Time (Optional)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </TabsContent>

              {/* Passenger Tab */}
              <TabsContent value="passenger" className="space-y-4 pt-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium">Passenger Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the passenger details for this ride.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passengerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passengerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="john.doe@example.com"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passengerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 (555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passengerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Driver Tab */}
              <TabsContent value="driver" className="space-y-4 pt-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium">Assign Driver</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a driver from the list of external users. These are
                    drivers who have connected to the mobile app.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="chauffeurId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Driver</FormLabel>
                      <Popover
                        open={openChauffeurPopover}
                        onOpenChange={setOpenChauffeurPopover}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openChauffeurPopover}
                              className="w-full justify-between"
                            >
                              {field.value && selectedChauffeur
                                ? formatChauffeurName(selectedChauffeur)
                                : field.value
                                ? "Loading driver..."
                                : "Select driver"}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search drivers..."
                              onValueChange={setChauffeurSearchTerm}
                            />
                            {isLoadingChauffeurs ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Loading drivers...
                              </div>
                            ) : filteredChauffeurs.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                <p>No drivers found.</p>
                                <p className="mt-2">
                                  Drivers need to connect via the mobile app
                                  first.
                                </p>
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  No driver found with that name.
                                </CommandEmpty>
                                <CommandGroup className="max-h-60 overflow-y-auto">
                                  {filteredChauffeurs.map((chauffeur) => (
                                    <CommandItem
                                      key={chauffeur.id}
                                      value={chauffeur.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "chauffeurId",
                                          chauffeur.id
                                        );
                                        setSelectedChauffeur(chauffeur);
                                        setOpenChauffeurPopover(false);
                                      }}
                                    >
                                      {formatChauffeurName(chauffeur)}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedChauffeur && (
                  <div className="mt-4 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">
                      Selected Driver Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Name:</div>
                      <div>{formatChauffeurName(selectedChauffeur)}</div>
                      {selectedChauffeur.phone && (
                        <>
                          <div className="text-muted-foreground">Phone:</div>
                          <div>{selectedChauffeur.phone}</div>
                        </>
                      )}
                      {selectedChauffeur.email && (
                        <>
                          <div className="text-muted-foreground">Email:</div>
                          <div>{selectedChauffeur.email}</div>
                        </>
                      )}
                      {selectedChauffeur.lastConnected && (
                        <>
                          <div className="text-muted-foreground">
                            Last Connected:
                          </div>
                          <div>
                            {new Date(
                              selectedChauffeur.lastConnected
                            ).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Flight Info Tab */}
              <TabsContent value="flight" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="flightNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AA1234" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Flight data display would go here */}
                {form.watch("flightNumber") && (
                  <div className="p-4 border rounded-md bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Flight information will be displayed here when available.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes about this ride..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
