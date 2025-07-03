/**
 * MongoDB Utilities
 *
 * Utility functions for MongoDB ObjectId validation and
 * other common database-related tasks.
 * 
 * @module @core/utils/api/mongo-utils
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../sys/log";

/**
 * Validates if a string is a valid MongoDB ObjectId (24 character hex string)
 * @param id The string to validate
 * @returns true if the string is a valid MongoDB ObjectId format
 */
export const isValidObjectId = (id: string | null | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Generate a sample valid MongoDB ObjectId for testing
 * @returns A valid-looking MongoDB ObjectId string
 */
export const generateTestObjectId = (): string => {
  return "507f1f77bcf86cd799439011";
};

/**
 * Safely creates a Date object from a date string
 * @param dateStr Date string to parse
 * @returns A valid Date object or null if parsing fails
 */
export const safeParseDate = (
  dateStr: string | Date | null | undefined
): Date | null => {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    logger.error("Error parsing date:", error);
    return null;
  }
}; 