/**
 * User type definitions for the Hoy application
 */
export interface User {
  id: string;
  _id?: string; // Legacy field for compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
  profileImage?: string;
  profilePicture?: string;
  phoneNumber?: string;
}
