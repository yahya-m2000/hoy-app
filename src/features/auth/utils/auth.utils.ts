// Auth utilities
export const formatUserName = (firstName?: string, lastName?: string): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName || lastName || 'User';
};