// Shared user types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'host' | 'traveler' | 'admin';
}