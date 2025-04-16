// src/components/ride-form-steps/PassengerStep.tsx

"use client";

import React, { useEffect } from "react";
import { UserIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StepProps } from "../types";
import { StepHeader } from "../form-helpers/StepHeader";
import { DEFAULT_PASSENGER_COUNT } from "../constants";

export const PassengerStep: React.FC<StepProps> = ({ form }) => {
  // Set useExistingPassenger to false by default
  useEffect(() => {
    form.setValue("useExistingPassenger", false, { shouldValidate: true });
  }, [form]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Passenger Information"
        description="Enter passenger details"
        icon={<UserIcon className="h-5 w-5" />}
      />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="passengerInfo.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengerInfo.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengerInfo.phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Phone Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengerInfo.passengerCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Passengers</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? DEFAULT_PASSENGER_COUNT
                        : parseInt(e.target.value)
                    )
                  }
                  value={field.value ?? DEFAULT_PASSENGER_COUNT}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengerInfo.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Passenger notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
