// User utilities
export const getUserDisplayName = (user: {firstName?: string, lastName?: string, email: string}): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.email.split('@')[0];
};