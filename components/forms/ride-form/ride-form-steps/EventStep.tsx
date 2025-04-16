"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { StepProps } from "../types";
import { StepHeader } from "../form-helpers/StepHeader";

import { Event } from "../types/rideFormTypes";

export const EventStep: React.FC<StepProps> = ({
  form,
  clients = [],
  events = [],
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedEventId = form.watch("eventId");

  // Filter events based on search term
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When an event is selected, automatically set the client
  useEffect(() => {
    if (selectedEventId) {
      const selectedEvent = events.find(
        (event) => event.id === selectedEventId
      );
      if (selectedEvent) {
        form.setValue("clientId", selectedEvent.clientId);
      }
    }
  }, [selectedEventId, events, form]);

  // Events are now passed as props

  return (
    <div className="space-y-6">
      <StepHeader
        title="Select Event"
        description="Choose the event for this ride"
        icon={<CalendarIcon className="h-5 w-5" />}
      />

      {/* Search input */}
      <div className="space-y-2">
        <FormLabel>Search Events</FormLabel>
        <div className="relative">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {isLoading ? (
            <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Event selection */}
      <FormField
        control={form.control}
        name="eventId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Display selected event details */}
      {selectedEventId && (
        <div className="p-4 border rounded-md bg-muted/50">
          <h4 className="font-medium mb-2">Selected Event</h4>
          <p className="text-sm">
            {events.find((e) => e.id === selectedEventId)?.title ||
              "Unknown event"}
          </p>
          {form.watch("clientId") && (
            <p className="text-sm mt-1">
              Client:{" "}
              {clients.find((c) => c.id === form.watch("clientId"))?.name ||
                "Unknown client"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
