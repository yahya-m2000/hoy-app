/**
 * Common Property Service
 * Re-exports property functions from host service for use across the app
 */

// Re-export all property service functions from the host service
export {
  fetchFeaturedProperties,
  searchProperties,
  fetchProperties,
  fetchPropertyById,
  getPropertyHostInfo,
  fetchPropertyHostInfo,
  fetchPublicHostProfile,
  type PropertyFilters,
} from "../../host/services/propertyService";
