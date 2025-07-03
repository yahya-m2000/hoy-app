/**
 * User initials utility function
 * Returns user initials for avatars and display purposes
 */

import { UtilityUser } from '@core/types/user.types';

// Type alias for backward compatibility
type User = UtilityUser;

/**
 * Get user initials for avatar display
 * @param user - User object containing profile information
 * @param maxLength - Maximum number of initials to return (default: 2)
 * @returns User initials string (e.g., "JD" for John Doe)
 */
export const getUserInitials = (
  user?: User | null,
  maxLength: number = 2
): string => {
  if (!user) {
    return "U";
  }

  const initials: string[] = [];

  // Try first and last name
  if (user.firstName?.trim()) {
    initials.push(user.firstName.trim()[0].toUpperCase());
  }
  if (user.lastName?.trim() && initials.length < maxLength) {
    initials.push(user.lastName.trim()[0].toUpperCase());
  }

  // If we have enough initials, return them
  if (initials.length > 0) {
    return initials.slice(0, maxLength).join("");
  }

  // Fallback to display name
  if (user.displayName?.trim()) {
    const words = user.displayName.trim().split(/\s+/);
    return words
      .slice(0, maxLength)
      .map((word) => word[0]?.toUpperCase() || "")
      .filter(Boolean)
      .join("");
  }

  // Fallback to email
  if (user.email) {
    const emailUsername = user.email.split("@")[0];
    if (emailUsername && emailUsername.length > 0) {
      return emailUsername[0].toUpperCase();
    }
  }

  // Final fallback
  return "U";
};
