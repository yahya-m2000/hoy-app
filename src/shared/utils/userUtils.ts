/**
 * User utility functions for the Hoy application
 * Contains helper functions for user-related operations
 */

export interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  displayName?: string;
}

/**
 * Get a personalized greeting message based on user data
 * @param isAuthenticated - Whether the user is authenticated
 * @param user - User data object
 * @returns Greeting string
 */
export const getGreeting = (
  isAuthenticated: boolean,
  user?: User | null
): string => {
  if (isAuthenticated && user) {
    // Use first name if available
    if (user.firstName) {
      return `Hi, ${user.firstName}`;
    }

    // Use display name if available
    if (user.displayName) {
      return `Hi, ${user.displayName}`;
    }

    // Use username if available
    if (user.username) {
      return `Hi, ${user.username}`;
    }

    // Fallback to email username if no other name is available
    if (user.email) {
      const emailUsername = user.email.split("@")[0];
      if (emailUsername) {
        return `Hi, ${emailUsername}`;
      }
    }
  }

  // Default greeting for unauthenticated users or users without name info
  return "Hi traveller";
};

/**
 * Get the display name for a user
 * @param user - User data object
 * @returns Display name string
 */
export const getDisplayName = (user?: User | null): string => {
  if (!user) return "User";

  // Priority order: displayName > firstName lastName > firstName > username > email username
  if (user.displayName) return user.displayName;

  if (user.firstName) {
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  }

  if (user.username) return user.username;

  if (user.email) {
    const emailUsername = user.email.split("@")[0];
    return emailUsername || "User";
  }

  return "User";
};

/**
 * Get initials from a user's name
 * @param user - User data object
 * @returns Initials string (e.g., "JD" for John Doe)
 */
export const getUserInitials = (user?: User | null): string => {
  if (!user) return "U";

  // Try first and last name
  if (user.firstName) {
    const firstInitial = user.firstName.charAt(0).toUpperCase();
    const lastInitial = user.lastName
      ? user.lastName.charAt(0).toUpperCase()
      : "";
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  }

  // Try display name
  if (user.displayName) {
    const parts = user.displayName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1]
        .charAt(0)
        .toUpperCase()}`;
    }
    return parts[0].charAt(0).toUpperCase();
  }

  // Try username
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }

  // Try email
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return "U";
};
