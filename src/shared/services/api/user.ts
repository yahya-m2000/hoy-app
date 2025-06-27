import api from "../core/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCurrentUser = async () => {
  // Generate random cache-busting params
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  try {
    // Get stored user ID to verify data integrity
    const storedUserId = await AsyncStorage.getItem("currentUserId");

    // Make request with robust cache prevention
    const response = await api.get<{ data: any }>(`/users/me`, {
      params: {
        _t: timestamp,
        _r: random,
        _v: "1.0.1", // Adding version to force cache invalidation
      },
      headers: {
        // Extra headers to prevent caching
        "Cache-Control": "no-cache, no-store, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
        "X-Timestamp": timestamp.toString(),
        "X-Client-ID": random, // Add unique ID for this request
      },
    });

    // Add metadata to returned data for integrity checking
    const userData = response.data.data;
    if (userData) {
      userData._fetchedAt = new Date().toISOString();

      // Verify this is the correct user's data
      if (storedUserId && userData._id && userData._id !== storedUserId) {
        console.error(
          `DATA INTEGRITY ERROR: User ID mismatch! Expected ${storedUserId}, got ${userData._id}`
        );

        // Store this so we can detect and fix on next app reload
        await AsyncStorage.setItem("userDataIntegrityError", "true");

        throw new Error("Data integrity error: User ID mismatch");
      }

      // If we don't have a stored ID yet, store it now
      if (!storedUserId && userData._id) {
        await AsyncStorage.setItem("currentUserId", userData._id);
      }
    }

    return userData;
  } catch (error) {
    console.error("Error fetching current user:", error);

    // Check if this is a data integrity error
    if (error instanceof Error && error.message.includes("integrity")) {
      // Trigger clean slate on next app launch
      await AsyncStorage.setItem("forceDataReset", "true");
    }

    throw error;
  }
};

export const updateProfile = async (profileData: any) => {
  const response = await api.put<{ data: any }>("/users/me", profileData);
  return response.data.data;
};

export const updatePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.put<{ data: any }>(
    "/users/me/password",
    passwordData
  );
  return response.data.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get<{ data: any }>(`/users/${id}`);
  return response.data.data;
};

export const getUserPreferences = async () => {
  const response = await api.get<{ data: any }>("/users/me/preferences");
  return response.data.data;
};

export const updateUserPreferences = async (preferencesData: any) => {
  const response = await api.put<{ data: any }>(
    "/users/me/preferences",
    preferencesData
  );
  return response.data.data;
};

export const getPaymentMethods = async () => {
  const response = await api.get<{ data: any[] }>("/users/me/payment-methods");
  return response.data.data;
};

export const addPaymentMethod = async (methodData: any) => {
  const response = await api.post<{ data: any }>(
    "/users/me/payment-methods",
    methodData
  );
  return response.data.data;
};
