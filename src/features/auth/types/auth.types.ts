// Auth feature types
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}