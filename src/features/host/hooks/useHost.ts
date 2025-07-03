import { useCallback } from "react";
import { host } from "@core/api/services";

export function useHostDashboard() {
  return useCallback(() => host.HostDashboardService.getDashboardData(), []);
}

export function useHostProperties() {
  return useCallback(
    (filters?: any) => host.HostPropertyService.getProperties(filters),
    []
  );
}

export function useHostPropertyDetails() {
  return useCallback(
    (propertyId: string) => host.HostPropertyService.getProperty(propertyId),
    []
  );
}

export function useCreateHostProperty() {
  return useCallback(
    (propertyData: any) => host.HostPropertyService.createProperty(propertyData),
    []
  );
}

export function useUpdateHostProperty() {
  return useCallback(
    (propertyId: string, propertyData: any) => {
      const updateData = { _id: propertyId, ...propertyData };
      return host.HostPropertyService.updateProperty(updateData);
    },
    []
  );
}

export function useDeleteHostProperty() {
  return useCallback(
    (propertyId: string) => host.HostPropertyService.deleteProperty(propertyId),
    []
  );
}

export function useHostReservations() {
  return useCallback(
    (status?: string) => host.HostReservationService.getReservations(status),
    []
  );
}

// export function useHostReservationDetails() {
//   return useCallback(
//     (bookingId: string) => host.HostReservationService.getReservationDetails(bookingId),
//     []
//   );
// }

// export function useUpdateHostReservationStatus() {
//   return useCallback(
//     (bookingId: string, status: string) =>
//       host.HostReservationService.updateReservationStatus(bookingId, status),
//     []
//   );
// }

export function useHostMessages() {
  return useCallback((params?: any) => host.fetchHostBookings(params), []);
}

export function useHostEarnings() {
  return useCallback(
    (period?: "week" | "month" | "year" | "all") => host.HostEarningsService.getEarnings(period),
    []
  );
}
