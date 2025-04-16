// src/components/RideForm.tsx

"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

// Import types, constants, utils
import { rideFormSchema } from "@/components/forms/ride-form/schemas/ride-schema";
import {
  DEFAULT_DURATION,
  MISSION_RIDE_CATEGORIES,
} from "@/components/forms/ride-form/constants";
import {
  RideFormValues,
  RideFormProps,
  User,
  StepProps,
} from "@/components/forms/ride-form/types";
import type { PassengerFormValues } from "@/components/forms/ride-form/schemas/passenger-schema";
import {
  getDefaultRideValues,
  getDefaultMissionValues,
} from "@/components/forms/ride-form/types/rideFormUtils";

// Import Steps
import { PassengerStep } from "@/components/forms/ride-form/ride-form-steps/PassengerStep";
import { RideDetailsStep } from "@/components/forms/ride-form/ride-form-steps/RideDetailsStep";
import { DriverStep } from "@/components/forms/ride-form/ride-form-steps/DriverStep";
import { MissionStep } from "@/components/forms/ride-form/ride-form-steps/MissionStep";
import { ReviewStep } from "@/components/forms/ride-form/ride-form-steps/ReviewStep";
import { EventStep } from "@/components/forms/ride-form/ride-form-steps/EventStep";
import { ClientStep } from "@/components/forms/ride-form/ride-form-steps/ClientStep";
import { LocationDetailsStep } from "@/components/forms/ride-form/ride-form-steps/LocationDetailsStep";
import { StepPath } from "@/components/forms/ride-form/form-helpers/StepPath";

export function RideForm({
  onAddRide,
  users = [],
  chauffeurs = [],
  clients: initialClients = [],
  partners = [],
  projects = [],
  existingMissions = [],
  defaultValues: initialDefaultValues, // Renamed to avoid conflict
  buttonText = "Add Ride",
  showMissionButton = true, // Keep this prop if explicitly needed outside mission context
}: RideFormProps) {
  // State for clients, events, and external users
  const [clients, setClients] = useState<any[]>(initialClients);
  const [events, setEvents] = useState<any[]>([]);
  const [externalUsers, setExternalUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch clients and events from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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

        // Fetch external users (drivers) from the database
        try {
          const externalUsersResponse = await fetch("/api/external-users");
          if (externalUsersResponse.ok) {
            const externalUsersData = await externalUsersResponse.json();
            setExternalUsers(externalUsersData);
          }
        } catch (error) {
          console.error("Error fetching external users:", error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const form = useForm({
    resolver: zodResolver(rideFormSchema) as any,
    defaultValues: getDefaultRideValues(initialDefaultValues),
    mode: "onChange", // Validate on change for better UX
  });

  const { control, handleSubmit, watch, setValue, getValues, reset, trigger } =
    form;

  const isMission = watch("isMission");

  const selectedRideType = watch("category");
  const selectedAirportSubtype = watch("airportTransferSubtype" as any);

  // Reset airport transfer fields when ride type changes
  React.useEffect(() => {
    if (selectedRideType !== "AIRPORT_TRANSFER") {
      setValue("airportTransferSubtype" as any, undefined as any);
      setValue("flightNumber" as any, "");
    }
  }, [selectedRideType, setValue]);

  // Reset flight number when airport transfer subtype changes
  React.useEffect(() => {
    if (selectedRideType === "AIRPORT_TRANSFER" && selectedAirportSubtype) {
      // Only reset if changing between subtypes, not on initial selection
      const currentFlightNumber = getValues("flightNumber" as any);
      if (currentFlightNumber) {
        setValue("flightNumber" as any, "");
      }
    }
  }, [selectedAirportSubtype, selectedRideType, setValue, getValues]);

  // --- Multi-Step Logic ---
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        id: "ride-type",
        label: "Ride Type",
        fields: [
          "category",
          "airportTransferSubtype",
          "flightNumber",
        ] as Path<RideFormValues>[],
      },
      {
        id: "event",
        label: "Event",
        fields: ["eventId"] as Path<RideFormValues>[],
      },
      {
        id: "client",
        label: "Client",
        fields: ["clientId"] as Path<RideFormValues>[],
      },
      {
        id: "passenger",
        label: "Passenger",
        fields: ["passengerInfo"] as Path<RideFormValues>[],
      },
      {
        id: "location-details",
        label: "Location Details",
        fields: [
          "pickupAddress",
          "dropoffAddress",
          "pickupTime",
          "duration",
          "status",
          "fare",
          "notes",
        ] as Path<RideFormValues>[],
      },
      ...(!isMission
        ? [
            {
              id: "driver",
              label: "Driver",
              fields: ["chauffeurId"] as Path<RideFormValues>[],
            },
          ]
        : []),
      ...(isMission
        ? [
            {
              id: "mission",
              label: "Mission",
              fields: ["mission"] as Path<RideFormValues>[],
            },
          ]
        : []),
      { id: "review", label: "Review", fields: [] as Path<RideFormValues>[] },
    ],
    [isMission]
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const validateStep = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const step = steps[stepIndex];
      if (!step || !step.fields || step.fields.length === 0) {
        return true;
      }
      console.log("Validating fields for step:", step.id, step.fields);
      const result = await trigger(step.fields as any);
      console.log("Validation result:", result);
      return result;
    },
    [trigger, steps]
  );

  const handleNext = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      nextStep();
    } else {
      console.log("Step validation failed", form.formState.errors);
    }
  }, [currentStep, validateStep, nextStep, form.formState.errors]);

  // --- Mission Handling ---
  const chauffeurHasExistingMission = useCallback(
    (chauffeurId: string): boolean => {
      return existingMissions.some(
        (mission) => mission.chauffeurId === chauffeurId
      );
    },
    [existingMissions]
  );

  const createNewMissionForChauffeur = useCallback(() => {
    const passengerInfo = getValues("passengerInfo");
    const missionTitle =
      passengerInfo?.firstName && passengerInfo?.lastName
        ? `Mission for ${passengerInfo.firstName} ${passengerInfo.lastName}`
        : "New Mission";
    const currentMissionValues = getValues("mission") || {};
    const chauffeurId = getValues("mission.chauffeurId");

    setValue("isMission", true, { shouldValidate: true });
    setValue(
      "mission",
      {
        ...(getDefaultMissionValues() as any),
        ...currentMissionValues,
        chauffeurId: chauffeurId || undefined,
        title: missionTitle,
        clientId: getValues("clientId") || "", // Use the selected client
        status: "SCHEDULED",
        passengerIds: [],
        startDate: new Date(), // Ensure proper Date object
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Ensure proper Date object
        duration: DEFAULT_DURATION,
        isExternalPartner: false,
        notes: "",
      },
      { shouldValidate: true }
    );

    const missionStepIndex = steps.findIndex((step) => step.id === "mission");
    if (missionStepIndex !== -1 && currentStep < missionStepIndex) {
      setCurrentStep(missionStepIndex);
    }
  }, [setValue, getValues, steps, currentStep]);

  // --- Form Submission ---
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const processAndSubmit = useCallback(
    async (data: RideFormValues) => {
      console.log("Form data submitted:", data);
      setSubmitting(true);
      setSubmitError(null);

      try {
        let finalData = { ...data };
        const potentialChauffeurId = data.mission?.chauffeurId;

        if (
          !finalData.isMission &&
          potentialChauffeurId &&
          !chauffeurHasExistingMission(potentialChauffeurId)
        ) {
          console.log(
            "Auto-creating mission for chauffeur:",
            potentialChauffeurId
          );
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const chauffeur = chauffeurs.find(
            (c) => c.id === potentialChauffeurId
          );
          const chauffeurName = chauffeur
            ? chauffeur.name
            : "Selected Chauffeur";
          const passenger = finalData.passengerInfo;
          const passengerName = passenger
            ? `${passenger.firstName} ${passenger.lastName}`
            : "New Passenger";

          finalData.isMission = true;
          finalData.mission = {
            ...getDefaultMissionValues(),
            ...(finalData.mission || {}),
            title: `Mission for ${passengerName} with ${chauffeurName}`,
            status: "SCHEDULED",
            clientId: clients[0]?.id || "",
            chauffeurId: potentialChauffeurId,
            passengerIds: [],
            startDate: today,
            endDate: tomorrow,
            isExternalPartner: false, // Explicitly set required boolean
            duration: DEFAULT_DURATION,
            rides: [
              {
                pickupAddress: finalData.pickupAddress,
                dropoffAddress: finalData.dropoffAddress || "",
                pickupTime: finalData.pickupTime,
                category: MISSION_RIDE_CATEGORIES.includes(
                  finalData.category as any
                )
                  ? (finalData.category as (typeof MISSION_RIDE_CATEGORIES)[number])
                  : "CITY_TRANSFER",
                status: "SCHEDULED",
                milestones: finalData.milestones || [],
                notes: finalData.notes || "",
                fare: finalData.fare,
              },
            ],
          };
          // Clear non-mission fields
          finalData.pickupAddress = "";
          finalData.dropoffAddress = "";
          finalData.category = "CITY_TRANSFER";
          finalData.status = "SCHEDULED";
          finalData.notes = "";
          finalData.fare = undefined;
          finalData.milestones = [];
        }

        // Submit the ride to the API
        const response = await fetch("/api/rides", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create ride");
        }

        const createdRide = await response.json();
        console.log("Ride created successfully:", createdRide);

        // Call the onAddRide callback with the created ride
        onAddRide(finalData);

        // Reset the form
        reset(getDefaultRideValues(initialDefaultValues));
        setCurrentStep(0);
      } catch (error) {
        console.error("Error creating ride:", error);
        setSubmitError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      onAddRide,
      reset,
      chauffeurs,
      users,
      clients,
      initialDefaultValues,
      chauffeurHasExistingMission,
    ]
  );

  // --- Render Logic ---
  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;
    const stepProps = {
      form,
      users,
      chauffeurs,
      clients,
      partners,
      projects,
      existingMissions,
      events,
      externalUsers,
      isLoading,
    };

    switch (stepId) {
      case "ride-type":
        return (
          <RideDetailsStep
            {...(stepProps as Required<StepProps>)}
            isMission={Boolean(isMission)}
          />
        );
      case "event":
        return <EventStep {...(stepProps as Required<StepProps>)} />;
      case "client":
        return <ClientStep {...(stepProps as Required<StepProps>)} />;
      case "passenger":
        return <PassengerStep {...(stepProps as Required<StepProps>)} />;
      case "location-details":
        return <LocationDetailsStep {...(stepProps as Required<StepProps>)} />;
      case "driver":
        return !isMission ? (
          <DriverStep {...(stepProps as Required<StepProps>)} />
        ) : null;
      case "mission":
        return isMission ? (
          <MissionStep {...(stepProps as Required<StepProps>)} />
        ) : null;
      case "review":
        return (
          <ReviewStep
            {...(stepProps as Required<StepProps>)}
            isMission={Boolean(isMission)}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(processAndSubmit)} className="space-y-6">
          {/* Step Path */}
          <StepPath
            steps={steps}
            currentStep={currentStep}
            onStepClick={(index) => {
              // Only allow going back to completed steps
              if (index < currentStep) {
                setCurrentStep(index);
              }
            }}
          />

          {/* Step Content */}
          <div className="min-h-[400px] overflow-x-hidden relative">
            <div
              className="transition-all duration-300 ease-in-out absolute w-full"
              style={{
                opacity: 1,
                transform: "translateX(0)",
              }}
            >
              {renderStepContent()}
            </div>
          </div>

          {/* Conditional "Create Mission" button */}
          {(currentStep === 0 || currentStep === 1) &&
            showMissionButton &&
            !isMission &&
            getValues("mission.chauffeurId") && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={createNewMissionForChauffeur}
                  className="w-full sm:w-auto"
                >
                  Create Mission for Chauffeur
                </Button>
              </div>
            )}

          {/* Mission Toggle */}
          {/* {currentStep !== steps.length - 1 && (
            <FormField
              control={control}
              name="isMission"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Mission Mode</FormLabel>
                    <FormDescription>
                      Enable for multi-day/multi-ride assignments.
                    </FormDescription>
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
          )} */}

          {/* Error message */}
          {submitError && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <p>Error: {submitError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-6 border-t">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="w-full sm:w-auto flex items-center"
                >
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
                </Button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Step indicator for mobile */}
              <div className="hidden xs:flex items-center text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto flex items-center"
                >
                  Next <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full sm:w-auto flex items-center"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      {buttonText}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
