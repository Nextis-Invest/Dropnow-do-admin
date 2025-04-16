"use client";

import React, { useState, useEffect } from "react";
import { BuildingIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StepProps } from "../types";
import { StepHeader } from "../form-helpers/StepHeader";

export const ClientStep: React.FC<StepProps> = ({
  form,
  clients = [],
  events = [],
  isLoading = false,
}) => {
  const selectedEventId = form.watch("eventId");
  const selectedClientId = form.watch("clientId");

  // Find the selected event from the events prop
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  // Set the client ID when the selected event changes
  useEffect(() => {
    if (selectedEvent && selectedEvent.clientId) {
      form.setValue("clientId", selectedEvent.clientId);
    }
  }, [selectedEvent, form]);

  // Filter clients based on the selected event
  const availableClients =
    selectedEventId && selectedEvent
      ? clients.filter((client) => client.id === selectedEvent.clientId)
      : clients;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Select Client"
        description="Choose the client for this ride"
        icon={<BuildingIcon className="h-5 w-5" />}
      />

      {selectedEventId ? (
        <>
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display selected client details */}
          {selectedClientId && (
            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium mb-2">Selected Client</h4>
              <p className="text-sm">
                {clients.find((c) => c.id === selectedClientId)?.name ||
                  "Unknown client"}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Please select an event first
          </p>
        </div>
      )}
    </div>
  );
};
