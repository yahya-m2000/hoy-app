/**
 * User greeting utility function
 * Returns a personalized greeting based on user authentication state and profile data
 */

interface User {
  firstName?: string;
  email?: string;
}

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
      return `Hi, ${firstName}`;
    }
    // Fallback to email username if no first name
    const emailUsername = user.email?.split("@")[0];
    if (emailUsername) {
      return `Hi, ${emailUsername}`;
    }
  }
  return "Hi traveller";
};
