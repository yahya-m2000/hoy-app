/**
 * Utility functions for date validation and formatting
 */

/**
 * Validates if a value can be parsed into a valid JavaScript Date
 * @param dateValue Any value that might be a date (string, Date object, timestamp)
 * @returns true if the value represents a valid date
 */
export const isValidDate = (dateValue: any): boolean => {
  if (!dateValue) return false;

  // If it's already a Date object, check if it's valid
  if (dateValue instanceof Date) return !isNaN(dateValue.getTime());

  // Try to parse the value as a Date
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

/**
 * Safely converts a value to a Date object with fallback
 * @param dateValue Any value that might be a date (string, Date object, timestamp)
 * @param fallback Optional fallback date to use if conversion fails (defaults to current date)
 * @returns A valid Date object
 */
export const toSafeDate = (dateValue: any, fallback?: Date): Date => {
  if (!dateValue) return fallback || new Date();

  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? fallback || new Date() : date;
  } catch (error) {
    console.warn("Error parsing date:", error);
    return fallback || new Date();
  }
};

/**
 * Formats a date value as ISO string with safety checks
 * @param dateValue Any value that might be a date
 * @returns ISO string representation of the date or null if invalid
 */
export const toSafeISOString = (dateValue: any): string | null => {
  if (!isValidDate(dateValue)) return null;

  try {
    return new Date(dateValue).toISOString();
  } catch (error) {
    console.warn("Error formatting date as ISO string:", error);
    return null;
  }
};

/**
 * Gets the relative time between a date and now (e.g., "5 minutes ago")
 * @param dateValue The date to compute relative time from
 * @param defaultValue Value to return if date is invalid
 * @returns Relative time string or defaultValue if date is invalid
 */
export const getRelativeTime = (
  dateValue: any,
  defaultValue: string = "Recently"
): string => {
  if (!isValidDate(dateValue)) return defaultValue;

  try {
    // Import dependencies dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { formatDistanceToNow } = require("date-fns");
    return formatDistanceToNow(new Date(dateValue), { addSuffix: true });
  } catch (error) {
    console.warn("Error formatting relative time:", error);
    return defaultValue;
  }
};
