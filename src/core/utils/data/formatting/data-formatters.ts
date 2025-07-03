/**
 * Utility functions for formatting data in the Hoy application
 */

/**
 * Format a number as currency (without currency symbol)
 * @param amount Number to format as currency
 * @param decimalPlaces Number of decimal places to show (default: 2)
 * @returns Formatted number string
 */
export const formatCurrency = (amount: number | null | undefined, decimalPlaces = 2): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }
  return amount.toFixed(decimalPlaces).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

/**
 * Format a date to a friendly string representation
 * @param date Date to format
 * @param format Format style (default: "medium")
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  format: "short" | "medium" | "long" = "medium"
): string => {
  if (!date) return "";

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (isNaN(dateObj.getTime())) return "";

  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { month: "numeric", day: "numeric", year: "2-digit" }
      : format === "long"
      ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };

  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Format a number with thousands separators
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a phone number to a standard format
 * @param phone Phone number to format
 * @returns Formatted phone number string
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
      3,
      6
    )}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.substring(0, 1)} (${cleaned.substring(
      1,
      4
    )}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
  }

  // If not a standard format, return original with non-numeric removed
  return cleaned;
};

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
};

/**
 * Truncate text to a specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length (default: 50)
 * @returns Truncated text string
 */
export const truncateText = (text: string, maxLength = 50): string => {
  if (!text || text.length <= maxLength) return text || "";
  return `${text.substring(0, maxLength)}...`;
};
