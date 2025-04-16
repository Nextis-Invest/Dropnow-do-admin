import { DEFAULT_DURATION, DEFAULT_PASSENGER_COUNT } from "./constants";
import { RideFormValues } from "./schemas/ride-schema";
import { MissionFormValues } from "./schemas/mission-schema";

export const getDefaultMissionValues = (): Partial<MissionFormValues> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    title: "",
    clientId: "",
    startDate: today,
    endDate: tomorrow,
    duration: DEFAULT_DURATION,
    status: "SCHEDULED",
    isExternalPartner: false,
    passengerIds: [],
    rides: [],
    notes: "",
  };
};

export const getDefaultRideValues = (
  defaults?: Partial<RideFormValues>
): RideFormValues => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    useExistingPassenger: false,
    status: defaults?.status || "SCHEDULED",
    pickupAddress: defaults?.pickupAddress || "",
    dropoffAddress: defaults?.dropoffAddress || "",
    pickupTime: defaults?.pickupTime || new Date(),
    category: defaults?.category || "CITY_TRANSFER",
    passengerInfo: {
      firstName: defaults?.passengerInfo?.firstName || "",
      lastName: defaults?.passengerInfo?.lastName || "",
      phoneNumber: defaults?.passengerInfo?.phoneNumber || "",
      passengerCount:
        defaults?.passengerInfo?.passengerCount ?? DEFAULT_PASSENGER_COUNT,
      description: defaults?.passengerInfo?.description || "",
    },
    notes: defaults?.notes || "",
    milestones: defaults?.milestones || [],
    isMission: defaults?.isMission || false,
    mission: {
      title: defaults?.mission?.title || "",
      clientId: defaults?.mission?.clientId || "",
      chauffeurId: defaults?.mission?.chauffeurId,
      partnerId: defaults?.mission?.partnerId,
      isExternalPartner: defaults?.mission?.isExternalPartner ?? false,
      projectId: defaults?.mission?.projectId,
      passengerIds: defaults?.mission?.passengerIds || [],
      startDate: defaults?.mission?.startDate || today,
      endDate: defaults?.mission?.endDate || tomorrow,
      duration: defaults?.mission?.duration ?? DEFAULT_DURATION,
      status: defaults?.mission?.status || "SCHEDULED",
      notes: defaults?.mission?.notes || "",
      totalBudget: defaults?.mission?.totalBudget,
      partnerFee: defaults?.mission?.partnerFee,
      rides: defaults?.mission?.rides || [],
    },
    fare: defaults?.fare,
    flightData: defaults?.flightData,
    flightNumber: defaults?.flightNumber || "",
    airportTransferSubtype: defaults?.airportTransferSubtype,
    // Default coordinates (Paris, France)
    pickupLatitude: defaults?.pickupLatitude || 48.8566,
    pickupLongitude: defaults?.pickupLongitude || 2.3522,
    dropoffLatitude: defaults?.dropoffLatitude || 48.8566,
    dropoffLongitude: defaults?.dropoffLongitude || 2.3522,
    // Driver assignment
    chauffeurId: defaults?.chauffeurId || "",
  };
};

export const chauffeurHasExistingMission = (
  chauffeurId: string,
  existingMissions: { id: string; chauffeurId: string }[] = []
): boolean => {
  return existingMissions.some(
    (mission) => mission.chauffeurId === chauffeurId
  );
};
