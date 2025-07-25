/**
 * User greeting utility function
 * Returns a personalized greeting based on user authentication state and profile data
 */

import { UtilityUser } from '@core/types/user.types';

// Type alias for backward compatibility (subset of UtilityUser)
type User = Pick<UtilityUser, 'firstName' | 'email'>;

/**
 * Get greeting text based on user state
 * @param isAuthenticated - Whether the user is authenticated
 * @param user - User object containing profile information
 * @returns Personalized greeting string
 */
export const getGreeting = (
  isAuthenticated: boolean,
  user?: User | null
): string => {
  if (isAuthenticated && user) {
    const firstName = user.firstName;
    if (firstName) {
      return `${firstName}`;
    }
    // Fallback to email username if no first name
    const emailUsername = user.email?.split("@")[0];
    if (emailUsername) {
      return `${emailUsername}`;
    }
  }
  return "traveller";
};
