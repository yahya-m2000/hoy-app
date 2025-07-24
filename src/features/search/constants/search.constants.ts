/**
 * Search feature constants
 */

export const SEARCH_ROUTES = {
  SEARCH: '/search',
  RESULTS: '/search/results',
  FILTERS: '/search/filters',
} as const;

export const SEARCH_FILTERS = {
  PRICE_RANGE: 'price_range',
  PROPERTY_TYPE: 'property_type',
  AMENITIES: 'amenities',
  INSTANT_BOOK: 'instant_book',
} as const;

export const DEFAULT_SEARCH_RADIUS = 25; // km

export const SEARCH_DEBOUNCE_DELAY = 300; // ms