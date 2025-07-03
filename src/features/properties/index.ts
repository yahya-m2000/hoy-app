/**
 * Properties Module
 * All property-related functionality exports
 */

// Export modals
export * from "./modals";

// Export shared hooks
export * from "./hooks";

// Export screens
export * from "./screens";

// Export features
export * from "./components";

// Export specific utilities to avoid conflicts (formatPrice excluded due to conflicts)
export { 
  formatLocation,
  formatPropertyDetails,
} from "./utils";
