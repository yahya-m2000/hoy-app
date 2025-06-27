/**
 * Properties Module
 * All property-related functionality exports
 */

// Export shared components
export * from "./components";

// Export modals
export * from "./modals";

// Export shared types
export * from "./types";

// Export shared hooks
export * from "./hooks";

// Export features
export * from "./features/details";
export * from "./features/reservation";
export * from "./features/reviews";

// Export specific utilities to avoid conflicts (formatPrice excluded due to conflicts)
export { 
  formatLocation,
  formatPropertyDetails,
} from "./utils";
