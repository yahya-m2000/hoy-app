/**
 * User type definitions for the Hoy application
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
}
