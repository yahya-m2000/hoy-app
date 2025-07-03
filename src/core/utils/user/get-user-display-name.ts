/**
 * User display name utility function
 * Returns the best available display name for a user
 */

import { UtilityUser } from '@core/types/user.types';

// Type alias for backward compatibility
type User = UtilityUser;

/**
 * Get the best display name for a user
 * Priority: displayName -> firstName lastName -> firstName -> email username -> 'User'
 * @param user - User object containing profile information
 * @returns User's display name
 */
export const getUserDisplayName = (user?: User | null): string => {
  if (!user) {
    return "User";
  }

  // First priority: explicit display name
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }

  // Second priority: first + last name
  if (user.firstName?.trim() && user.lastName?.trim()) {
    return `${user.firstName.trim()} ${user.lastName.trim()}`;
  }

  // Third priority: just first name
  if (user.firstName?.trim()) {
    return user.firstName.trim();
  }

  // Fourth priority: email username
  if (user.email) {
    const emailUsername = user.email.split("@")[0];
    if (emailUsername) {
      return emailUsername;
    }
  }

  // Fallback
  return "User";
};
