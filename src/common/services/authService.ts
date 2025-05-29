import api from "./api";
import axios from "axios";
import Constants from "expo-constants";

// Use expoConfig for baseURL, fallback to localhost
const apiBaseUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "user" | "host";
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<{
    data: { user: any; accessToken: string; refreshToken?: string };
  }>("/auth/login", credentials, { withCredentials: true });

  // Get refresh token from cookies (if running in a browser) or response
  let refreshToken = response.data.data.refreshToken || "";

  if (!refreshToken) {
    // For development purposes, you might need to manually extract from the response
    const cookieHeader = response.headers["set-cookie"];
    if (cookieHeader) {
      const refreshCookie = cookieHeader.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );
      if (refreshCookie) {
        refreshToken = refreshCookie.split(";")[0].replace("refreshToken=", "");
      }
    }
  }

  return {
    user: response.data.data.user,
    accessToken: response.data.data.accessToken,
    refreshToken,
  };
};

export const register = async (credentials: RegisterCredentials) => {
  const response = await api.post<{ data: any }>("/auth/register", credentials);
  return response.data.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post<{ success: boolean; message: string }>(
    "/auth/forgot-password",
    { email }
  );
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.post<{ success: boolean; message: string }>(
    "/auth/reset-password",
    { token, newPassword }
  );
  return response.data;
};

export const refreshToken = async (refreshToken: string): Promise<Tokens> => {
  // Use a fresh axios instance to prevent interceptor loops
  try {
    // In React Native, we need to send the refresh token in the request body
    // since cookies don't work the same way as in browsers
    const response = await axios.post<{
      data: { accessToken: string; refreshToken?: string };
    }>(
      `${apiBaseUrl}/auth/refresh-token`,
      { refreshToken }, // Send token in request body
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Include both approaches for maximum compatibility
        withCredentials: true,
      }
    );

    // Return both tokens - if new refresh token isn't provided, use the existing one
    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken || refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const logout = async () => {
  await api.post("/auth/logout", {}, { withCredentials: true });
};
