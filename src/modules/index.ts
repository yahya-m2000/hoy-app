/**
 * Main modules index file
 * Centralized exports for all domain modules
 *
 * Note: Import modules directly to avoid naming conflicts
 * Example: import { PropertyCard } from '@modules/properties'
 */

// Re-export modules individually to avoid conflicts
export * as Properties from "./properties";
export * as Booking from "./booking";
export * as Search from "./search";
export * as Auth from "./auth";
export * as Account from "./account";
