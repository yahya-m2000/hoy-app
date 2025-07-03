/**
 * Date Utilities
 *
 * Utility functions for date formatting, parsing, and manipulation
 * with internationalization support and common date operations.
 * 
 * @module @core/utils/formatting/date-utils
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../../sys/log";

/**
 * Format a date to a readable string
 * @param date Date to format
 * @param locale Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = "en-US"
): string => {
  try {
    const dateObj = 
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    logger.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format a date to short format (MM/DD/YYYY)
 * @param date Date to format
 * @returns Short formatted date string
 */
export const formatDateShort = (date: Date | string | number): string => {
  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj);
  } catch (error) {
    logger.error("Error formatting date short:", error);
    return "Invalid date";
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date Date to get relative time for
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date | string | number): string => {
  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  } catch (error) {
    logger.error("Error getting relative time:", error);
    return "Unknown time";
  }
}; 