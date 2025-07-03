/**
 * Search Services
 * 
 * Centralized exports for all search-related services.
 * 
 * Service Classes:
 * - SearchService - Advanced property search and location services
 * 
 * @module @core/api/services/search
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Export service class
export { SearchService } from './search.service';

// Export types and interfaces
export type {
  SearchFilters,
  LocationSuggestion,
  TrendingSearch,
  SearchResults,
} from './search.service';

// Export legacy functions for backward compatibility
export {
  searchPropertiesAdvanced,
  getLocationSuggestions,
  getNearbySearch,
  getTrendingSearches,
} from './search.service'; 