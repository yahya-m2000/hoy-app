/**
 * Property Formatting Utilities
 * Functions for formatting property-related data
 */

/**
 * Format a price with currency symbol
 * @param price The price to format
 * @param currency The currency code (default: USD)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format a location string from property location data
 * @param city The city name
 * @param country The country name
 * @param state The state/province name (optional)
 * @returns Formatted location string
 */
export const formatLocation = (city: string, country: string, state?: string): string => {
  if (state) {
    return `${city}, ${state}, ${country}`;
  }
  return `${city}, ${country}`;
};

/**
 * Format property details as a string
 * @param guests Maximum number of guests
 * @param bedrooms Number of bedrooms
 * @param beds Number of beds
 * @param baths Number of bathrooms
 * @returns Formatted property details string
 */
export const formatPropertyDetails = (
  guests: number,
  bedrooms: number,
  beds: number,
  baths: number
): string => {
  return `${guests} guest${guests !== 1 ? "s" : ""} · ${bedrooms} bedroom${
    bedrooms !== 1 ? "s" : ""
  } · ${beds} bed${beds !== 1 ? "s" : ""} · ${baths} bath${baths !== 1 ? "s" : ""}`;
}; 