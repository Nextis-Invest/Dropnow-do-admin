"use client";

import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import {
  PlusIcon,
  TrashIcon,
  SearchIcon,
  CheckIcon,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
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
import { DateTimePicker } from "../form-helpers/DateTimePicker";
import { DatePicker } from "../form-helpers/DatePicker"; // Adjust path
import type { StepProps, ExternalUser } from "../types"; // Adjust path
import { MISSION_RIDE_CATEGORIES, DEFAULT_DURATION } from "../constants"; // Adjust path
import { getMissionRideCategoryLabel } from "../types/rideFormUtils"; // Adjust path

export const MissionStep: React.FC<StepProps> = ({
  form,
  clients = [],
  partners = [],
  projects = [],
  users = [],
  externalUsers = [],
  isLoading = false,
}) => {
  const {
    fields: missionRideFields,
    append: appendRide,
    remove: removeRide,
  } = useFieldArray({
    control: form.control,
    name: "mission.rides",
  });
  const isExternalPartner = form.watch("mission.isExternalPartner");

  // State for chauffeur search
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chauffeurs based on search term
  const filteredChauffeurs = externalUsers.filter((driver) => {
    if (!searchTerm) return true;

    const fullName = `${driver.firstName || ""} ${driver.lastName || ""}`
      .trim()
      .toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      (driver.email && driver.email.toLowerCase().includes(searchLower)) ||
      (driver.externalId &&
        driver.externalId.toLowerCase().includes(searchLower)) ||
      (driver.phone && driver.phone.includes(searchLower))
    );
  });

  // Get the selected chauffeur
  const selectedChauffeurId = form.watch("mission.chauffeurId");
  const selectedChauffeur = externalUsers.find(
    (d) => d.id === selectedChauffeurId
  );

  // Format chauffeur name for display
  const formatChauffeurName = (driver: ExternalUser) => {
    if (driver.firstName && driver.lastName) {
      return `${driver.firstName} ${driver.lastName}`;
    }
    return `Driver ${driver.externalId}`;
  };

  return (
    <div className="border border-dashed rounded-xl p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mission Details</h3>
        <FormField
          control={form.control}
          name="mission.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Title</FormLabel>
              <FormControl>
                <Input placeholder="Mission Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="mission.clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
            name="mission.isExternalPartner"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto mb-1.5">
                <div className="space-y-0.5">
                  <FormLabel>Use External Partner</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Partner/Chauffeur/Project */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isExternalPartner ? (
            <FormField
              control={form.control}
              name="mission.partnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Partner</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="mission.chauffeurId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Chauffeur</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && selectedChauffeur
                              ? formatChauffeurName(selectedChauffeur)
                              : "Select chauffeur"}
                            <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search chauffeurs..."
                            onValueChange={setSearchTerm}
                          />
                          {isLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                              Loading chauffeurs...
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No chauffeur found.</CommandEmpty>
                              <CommandGroup>
                                {filteredChauffeurs.map((driver) => (
                                  <CommandItem
                                    key={driver.id}
                                    value={driver.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "mission.chauffeurId",
                                        driver.id
                                      );
                                      setOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        driver.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{formatChauffeurName(driver)}</span>
                                      {driver.email && (
                                        <span className="text-xs text-muted-foreground">
                                          {driver.email}
                                        </span>
                                      )}
                                    </div>
                                    <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      External
                                    </span>
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

              {/* Display selected chauffeur information if available */}
              {selectedChauffeur && (
                <div className="col-span-2 mt-2 p-4 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-2 flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Selected External Driver
                  </h4>
                  <div className="text-sm">
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {formatChauffeurName(selectedChauffeur)}
                      </p>
                      {selectedChauffeur.email && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {selectedChauffeur.email}
                        </p>
                      )}
                      {selectedChauffeur.phone && (
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {selectedChauffeur.phone}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">External ID:</span>{" "}
                        {selectedChauffeur.externalId}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <FormField
            control={form.control}
            name="mission.projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Passengers */}
        <FormField
          control={form.control}
          name="mission.passengerIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passengers</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mission-passenger-${user.id}`}
                      checked={field.value?.includes(user.id)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        field.onChange(
                          checked
                            ? [...currentValues, user.id]
                            : currentValues.filter((id) => id !== user.id)
                        );
                      }}
                    />
                    <label
                      htmlFor={`mission-passenger-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {user.name}
                    </label>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No users available to select.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates & Duration */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="mission.startDate"
            render={({ field }) => (
              <DatePicker
                label="Start Date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={form.control}
            name="mission.endDate"
            render={({ field }) => (
              <DatePicker
                label="End Date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="mission.duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="0.5"
                    placeholder={`${DEFAULT_DURATION}`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mission.totalBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Budget (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Partner Fee */}
        {isExternalPartner && (
          <FormField
            control={form.control}
            name="mission.partnerFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner Fee (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="mission.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes about the overall mission..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rides within Mission */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Rides in this Mission</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendRide({
                  pickupAddress: "",
                  dropoffAddress: "",
                  pickupTime: new Date(),
                  category: "CITY_TRANSFER",
                  status: "SCHEDULED",
                  milestones: [],
                })
              }
            >
              <PlusIcon className="mr-1 h-4 w-4" /> Add Ride
            </Button>
          </div>
          {missionRideFields.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">
                No rides added yet. Click "Add Ride".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {missionRideFields.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-muted/50 border rounded-xl p-6"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRide(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                  <div className="pt-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`mission.rides.${index}.category`}
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
                                {MISSION_RIDE_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {getMissionRideCategoryLabel(cat)}
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
                        name={`mission.rides.${index}.pickupTime`}
                        render={({ field }) => (
                          <DateTimePicker
                            label="Pickup Time"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      <FormField
                        control={form.control}
                        name={`mission.rides.${index}.pickupAddress`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Pickup Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mission.rides.${index}.dropoffAddress`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dropoff Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Dropoff Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Consider adding notes/fare per mission ride if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
