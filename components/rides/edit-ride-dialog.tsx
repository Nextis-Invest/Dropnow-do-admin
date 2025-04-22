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
import { DateTimePicker } from "@/components/forms/ride-form/form-helpers/DateTimePicker";
import { AddressAutocomplete } from "@/components/forms/ride-form/form-helpers/AddressAutocomplete";
import { RIDE_STATUSES } from "@/components/forms/ride-form/constants";
import { Loader2 } from "lucide-react";

// Define the schema for the edit form
const editRideSchema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),
  dropoffLatitude: z.number().optional(),
  dropoffLongitude: z.number().optional(),
  status: z.string().min(1, "Status is required"),
  fare: z.number().optional(),
  notes: z.string().optional(),
  chauffeurId: z.string().optional(),
});

type EditRideFormValues = z.infer<typeof editRideSchema>;

interface EditRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rideData: any; // Replace with proper type
  onRideUpdated: () => void;
}

export function EditRideDialog({
  open,
  onOpenChange,
  rideData,
  onRideUpdated,
}: EditRideDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [isLoadingChauffeurs, setIsLoadingChauffeurs] = useState(false);

  // Initialize form with ride data
  const form = useForm<EditRideFormValues>({
    resolver: zodResolver(editRideSchema),
    defaultValues: {
      pickupAddress: rideData?.pickupAddress || "",
      dropoffAddress: rideData?.dropoffAddress || "",
      pickupTime: rideData?.pickupTime ? new Date(rideData.pickupTime) : new Date(),
      pickupLatitude: rideData?.pickupLatitude,
      pickupLongitude: rideData?.pickupLongitude,
      dropoffLatitude: rideData?.dropoffLatitude,
      dropoffLongitude: rideData?.dropoffLongitude,
      status: rideData?.status || "SCHEDULED",
      fare: rideData?.fare || 0,
      notes: rideData?.notes || "",
      chauffeurId: rideData?.chauffeurId || "",
    },
  });

  // Fetch chauffeurs when dialog opens
  useEffect(() => {
    if (open) {
      const fetchChauffeurs = async () => {
        setIsLoadingChauffeurs(true);
        try {
          const response = await fetch("/api/external-users");
          if (response.ok) {
            const data = await response.json();
            setChauffeurs(data);
          } else {
            toast.error("Failed to load chauffeurs");
          }
        } catch (error) {
          console.error("Error fetching chauffeurs:", error);
          toast.error("Failed to load chauffeurs");
        } finally {
          setIsLoadingChauffeurs(false);
        }
      };

      fetchChauffeurs();
    }
  }, [open]);

  // Handle form submission
  const onSubmit = async (data: EditRideFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rides/${rideData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ride {rideData?.rideNumber}</DialogTitle>
          <DialogDescription>
            Update the details of this ride. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Pickup Address */}
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

              {/* Dropoff Address */}
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

              {/* Pickup Time */}
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

              {/* Status */}
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
                            {status.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chauffeur */}
              <FormField
                control={form.control}
                name="chauffeurId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chauffeur</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chauffeur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingChauffeurs ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : (
                          chauffeurs.map((chauffeur) => (
                            <SelectItem key={chauffeur.id} value={chauffeur.id}>
                              {chauffeur.firstName && chauffeur.lastName
                                ? `${chauffeur.firstName} ${chauffeur.lastName}`
                                : `Driver ${chauffeur.externalId}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fare */}
              <FormField
                control={form.control}
                name="fare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fare (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseFloat(value));
                        }}
                        value={field.value === 0 ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this ride"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
