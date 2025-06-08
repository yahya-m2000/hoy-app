import { useCallback } from "react";
import * as hostService from "@shared/services/hostService";

export function useHostDashboard() {
  return useCallback(() => hostService.fetchHostDashboard(), []);
}

export function useHostProperties() {
  return useCallback(
    (params?: any) => hostService.fetchHostProperties(params),
    []
  );
}

export function useHostPropertyDetails() {
  return useCallback(
    (propertyId: string) => hostService.fetchHostPropertyDetails(propertyId),
    []
  );
}

export function useCreateHostProperty() {
  return useCallback(
    (propertyData: any) => hostService.createHostProperty(propertyData),
    []
  );
}

export function useUpdateHostProperty() {
  return useCallback(
    (propertyId: string, propertyData: any) =>
      hostService.updateHostProperty(propertyId, propertyData),
    []
  );
}

export function useDeleteHostProperty() {
  return useCallback(
    (propertyId: string) => hostService.deleteHostProperty(propertyId),
    []
  );
}

export function useHostReservations() {
  return useCallback(
    (params?: any) => hostService.fetchHostReservations(params),
    []
  );
}

// export function useHostReservationDetails() {
//   return useCallback(
//     (bookingId: string) => hostService.fetchHostReservationDetails(bookingId),
//     []
//   );
// }

// export function useUpdateHostReservationStatus() {
//   return useCallback(
//     (bookingId: string, status: string) =>
//       hostService.updateHostReservationStatus(bookingId, status),
//     []
//   );
// }

export function useHostMessages() {
  return useCallback((params?: any) => hostService.fetchHostMessages(), []);
}

export function useHostEarnings() {
  return useCallback(
    (params?: any) => hostService.fetchHostEarnings(params),
    []
  );
}
