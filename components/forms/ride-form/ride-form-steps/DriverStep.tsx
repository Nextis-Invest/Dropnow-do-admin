"use client";

import React, { useState } from "react";
import { UserIcon, SearchIcon, CheckIcon, ExternalLink } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
import type { StepProps } from "../types";
import { StepHeader } from "../form-helpers/StepHeader";
import { ExternalUser } from "../types";

export const DriverStep: React.FC<StepProps> = ({
  form,
  externalUsers = [],
  isLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter drivers based on search term
  const filteredDrivers = externalUsers.filter((driver) => {
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

  // Get the selected driver
  const selectedDriverId = form.watch("chauffeurId");
  const selectedDriver = externalUsers.find((d) => d.id === selectedDriverId);

  // Format driver name for display
  const formatDriverName = (driver: ExternalUser) => {
    if (driver.firstName && driver.lastName) {
      return `${driver.firstName} ${driver.lastName}`;
    }
    return `Driver ${driver.externalId}`;
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Driver Assignment"
        description="Select a driver for this ride"
        icon={<UserIcon className="h-5 w-5" />}
      />

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading drivers...
          </p>
        </div>
      ) : externalUsers.length === 0 ? (
        <div className="py-8 text-center border rounded-md">
          <ExternalLink className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No external drivers found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add drivers from the Users page
          </p>
        </div>
      ) : (
        <>
          <FormField
            control={form.control}
            name="chauffeurId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Driver</FormLabel>
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
                        {field.value && selectedDriver
                          ? formatDriverName(selectedDriver)
                          : "Select driver"}
                        <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search drivers..."
                        onValueChange={setSearchTerm}
                      />
                      {isLoading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Loading drivers...
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No driver found.</CommandEmpty>
                          <CommandGroup>
                            {filteredDrivers.map((driver) => (
                              <CommandItem
                                key={driver.id}
                                value={driver.id}
                                onSelect={() => {
                                  form.setValue("chauffeurId", driver.id);
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
                                  <span>{formatDriverName(driver)}</span>
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

          {/* Display selected driver information if available */}
          {selectedDriver && (
            <div className="mt-4 p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Selected External Driver
              </h4>
              <div className="text-sm">
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formatDriverName(selectedDriver)}
                  </p>
                  {selectedDriver.email && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedDriver.email}
                    </p>
                  )}
                  {selectedDriver.phone && (
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedDriver.phone}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">External ID:</span>{" "}
                    {selectedDriver.externalId}
                  </p>
                  {selectedDriver.lastConnected && (
                    <p>
                      <span className="font-medium">Last Connected:</span>{" "}
                      {new Date(selectedDriver.lastConnected).toLocaleString()}
                    </p>
                  )}
                  {selectedDriver.deviceInfo && (
                    <p>
                      <span className="font-medium">Device:</span>{" "}
                      {selectedDriver.deviceInfo.deviceName ||
                        selectedDriver.deviceInfo.deviceModel ||
                        "Unknown device"}
                      {selectedDriver.deviceInfo.platform &&
                        ` (${selectedDriver.deviceInfo.platform})`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
