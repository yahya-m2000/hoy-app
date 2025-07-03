/**
 * Property Services
 * 
 * Centralized exports for all property-related services.
 * 
 * Service Classes:
 * - PropertySearchService - Property search and discovery
 * - PropertyDetailsService - Property details and specific operations
 * - PropertyPoliciesService - Property policies and rules
 * - PropertyHostService - Host-related operations
 * - PropertyManagementService - Property management operations
 * 
 * @module @core/api/services/property
 * @author Hoy Development Team
 * @version 2.0.0
 */

// Export service classes
export {
  PropertySearchService,
  PropertyDetailsService,
  PropertyPoliciesService,
  PropertyHostService,
  PropertyManagementService,
} from './property.service';

// Export types and interfaces
export type {
  PropertyFilters,
  PropertyCoordinates,
  PropertyAvailability,
  CreatePropertyResponse,
  GetPropertiesResponse,
  PropertyResponse,
} from './property.service';

// Export legacy functions for backward compatibility
export {
  getProperties,
  getFeaturedProperties,
  searchProperties,
  getNearbyProperties,
  getPropertyById,
  getPropertyCalendar,
  getAvailableDates,
  getPropertyUnits,
  getUnitById,
  getPropertyReviews,
  getPropertyHostInfo,
  fetchPropertyHostInfo,
  getPublicHostProfile,
  // Property management functions (CRUD operations)
  getHostProperties,
  getHostProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
} from './property.service';

// Re-export core types for convenience
export type {
  PropertyType,
  ICancellationPolicy,
  IHouseRules,
  ISafetyFeatures,
  ICheckInExperience,
} from '@core/types/property.types'; 