// Host setup and policies
export * from "./useHostPolicies";
export * from "./useHostSetupWithState";
export * from "./useHostSetupStatus";
export { useHostSetupNew } from "./useHostSetupNew";

// Properties - prioritize React Query implementation and add simple version with different name
export { useHostProperties, useHostProperty } from "./useHostProperties";
export { useProperties, useProperty } from "./useProperties";

// Bookings
export * from "./useHostBookings";
export * from "./useBookingActions";

// Dashboard - prioritize React Query version over basic implementation 
export { useHostDashboard } from "./useHostDashboard";

// Calendar
export * from "./useHostCalendar";

// Insights
export * from "./useHostInsights";

// Host basic functions - selective export to avoid conflicts
export {
  useHostPropertyDetails,
  useCreateHostProperty,
  useUpdateHostProperty, 
  useDeleteHostProperty,
  useHostReservations,
  useHostMessages,
  useHostEarnings
} from "./useHost";
