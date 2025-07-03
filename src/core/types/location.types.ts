/**
 * Location Types
 * 
 * Comprehensive type definitions for location and geographical data including:
 * - Location parsing and formatting
 * - Geographical coordinates and regions
 * - Location search and validation
 * 
 * @module @core/types/location
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// PARSED LOCATION TYPES
// ========================================

/**
 * Parsed location structure from location string parsing
 */
export interface ParsedLocation {
  /** City name */
  city?: string;
  /** State/province name */
  state?: string;
  /** Country name */
  country?: string;
  /** Original unparsed location string */
  originalLocation: string;
}

/**
 * Location search parameters for API queries
 */
export interface LocationSearchParams {
  /** City filter */
  city?: string;
  /** State/province filter */
  state?: string;
  /** Country filter */
  country?: string;
  /** Radius for geographical search */
  radius?: number;
  /** Latitude coordinate */
  lat?: number;
  /** Longitude coordinate */
  lng?: number;
}

// ========================================
// GEOGRAPHICAL TYPES
// ========================================

/**
 * Geographical coordinates
 */
export interface GeoCoordinates {
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
  /** Accuracy in meters (optional) */
  accuracy?: number;
  /** Altitude in meters (optional) */
  altitude?: number;
}

/**
 * Geographical bounds/viewport
 */
export interface GeoBounds {
  /** Northeast corner coordinates */
  northeast: GeoCoordinates;
  /** Southwest corner coordinates */
  southwest: GeoCoordinates;
}

/**
 * Location validation result
 */
export interface LocationValidation {
  /** Whether location is valid */
  isValid: boolean;
  /** Validation error message if invalid */
  error?: string;
  /** Suggested correction if available */
  suggestion?: string;
}

// ========================================
// REGION TYPES
// ========================================

/**
 * Supported geographical regions
 */
export type SupportedRegion = 
  | "united-states"
  | "canada"
  | "australia" 
  | "united-kingdom"
  | "germany"
  | "france"
  | "spain"
  | "italy"
  | "international";

/**
 * Region-specific location data
 */
export interface RegionalLocation {
  /** Detected region */
  region: SupportedRegion;
  /** Parsed location data */
  location: ParsedLocation;
  /** Region-specific formatting rules applied */
  formatted: string;
} 