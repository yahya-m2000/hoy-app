/**
 * Location Parser Utility
 * Intelligently parses location strings to properly categorize cities, states, and countries
 */

// US States and territories
const US_STATES = new Set([
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
  "Puerto Rico",
  "Guam",
  "American Samoa",
  "U.S. Virgin Islands",
  "Northern Mariana Islands",
]);

// Canadian provinces and territories
const CANADIAN_PROVINCES = new Set([
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
]);

// Australian states and territories
const AUSTRALIAN_STATES = new Set([
  "New South Wales",
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Northern Territory",
  "Australian Capital Territory",
]);

// UK countries and regions
const UK_REGIONS = new Set([
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
]);

// German states
const GERMAN_STATES = new Set([
  "Baden-Württemberg",
  "Bavaria",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hesse",
  "Lower Saxony",
  "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia",
  "Rhineland-Palatinate",
  "Saarland",
  "Saxony",
  "Saxony-Anhalt",
  "Schleswig-Holstein",
  "Thuringia",
]);

// Common country names that might be confused with states
const COUNTRIES = new Set([
  "United States",
  "Canada",
  "Australia",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Russia",
]);

export interface ParsedLocation {
  city?: string;
  state?: string;
  country?: string;
  originalLocation: string;
}

/**
 * Check if a location name is a state/province
 */
function isState(locationName: string, country?: string): boolean {
  const normalizedName = locationName.trim();

  // Check based on country context
  if (country) {
    const normalizedCountry = country.toLowerCase();

    if (
      normalizedCountry.includes("united states") ||
      normalizedCountry.includes("usa")
    ) {
      return US_STATES.has(normalizedName);
    }

    if (normalizedCountry.includes("canada")) {
      return CANADIAN_PROVINCES.has(normalizedName);
    }

    if (normalizedCountry.includes("australia")) {
      return AUSTRALIAN_STATES.has(normalizedName);
    }

    if (
      normalizedCountry.includes("united kingdom") ||
      normalizedCountry.includes("uk")
    ) {
      return UK_REGIONS.has(normalizedName);
    }

    if (normalizedCountry.includes("germany")) {
      return GERMAN_STATES.has(normalizedName);
    }
  }

  // Check all state lists if no country context
  return (
    US_STATES.has(normalizedName) ||
    CANADIAN_PROVINCES.has(normalizedName) ||
    AUSTRALIAN_STATES.has(normalizedName) ||
    UK_REGIONS.has(normalizedName) ||
    GERMAN_STATES.has(normalizedName)
  );
}

/**
 * Check if a location name is a country
 */
function isCountry(locationName: string): boolean {
  return COUNTRIES.has(locationName.trim());
}

/**
 * Parse a location string into city, state, and country components
 * Examples:
 * - "Malibu, California, United States" → { city: "Malibu", state: "California", country: "United States" }
 * - "California, United States" → { state: "California", country: "United States" }
 * - "Paris, France" → { city: "Paris", country: "France" }
 * - "New York" → { city: "New York" }
 */
export function parseLocation(locationString: string): ParsedLocation {
  if (!locationString || typeof locationString !== "string") {
    return { originalLocation: locationString || "" };
  }

  const parts = locationString
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const result: ParsedLocation = { originalLocation: locationString };

  if (parts.length === 0) {
    return result;
  }

  if (parts.length === 1) {
    // Single part - could be city, state, or country
    const part = parts[0];

    if (isCountry(part)) {
      result.country = part;
    } else if (isState(part)) {
      result.state = part;
    } else {
      result.city = part;
    }

    return result;
  }

  if (parts.length === 2) {
    // Two parts - [city/state, country] or [city, state]
    const [first, second] = parts;

    if (isCountry(second)) {
      // Format: [city/state, country]
      result.country = second;

      if (isState(first, second)) {
        result.state = first;
      } else {
        result.city = first;
      }
    } else {
      // Format: [city, state] (assuming no country)
      if (isState(second)) {
        result.city = first;
        result.state = second;
      } else {
        // Default behavior - treat as city, country
        result.city = first;
        result.country = second;
      }
    }

    return result;
  }

  if (parts.length >= 3) {
    // Three or more parts - assume [city, state, country, ...]
    const [first, second, third] = parts;

    // Last part is usually the country
    if (isCountry(third)) {
      result.country = third;

      // Check if second part is a state
      if (isState(second, third)) {
        result.city = first;
        result.state = second;
      } else {
        // Might be a city with multiple parts
        result.city = `${first}, ${second}`;
      }
    } else {
      // Fallback - treat as complex city name
      result.city = parts.slice(0, -1).join(", ");
      result.country = parts[parts.length - 1];
    }
  }

  return result;
}

/**
 * Create search parameters from parsed location
 */
export function createSearchParams(
  parsedLocation: ParsedLocation
): Record<string, string> {
  const params: Record<string, string> = {};

  if (parsedLocation.city) {
    params.city = parsedLocation.city;
  }

  if (parsedLocation.state) {
    params.state = parsedLocation.state;
  }

  if (parsedLocation.country) {
    params.country = parsedLocation.country;
  }

  return params;
}

/**
 * Format a parsed location back to a display string
 */
export function formatLocationDisplay(parsedLocation: ParsedLocation): string {
  const parts: string[] = [];

  if (parsedLocation.city) parts.push(parsedLocation.city);
  if (parsedLocation.state) parts.push(parsedLocation.state);
  if (parsedLocation.country) parts.push(parsedLocation.country);

  return parts.length > 0 ? parts.join(", ") : parsedLocation.originalLocation;
}
