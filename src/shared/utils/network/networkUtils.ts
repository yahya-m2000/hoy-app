import NetInfo from "./netInfoCompat";

/**
 * Check if the device is currently connected to the internet
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const isConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

/**
 * Subscribe to network state changes
 * @param callback - Function to call when network state changes
 * @returns Unsubscribe function
 */
export const subscribeToNetworkChanges = (
  callback: (isConnected: boolean) => void
) => {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected === true);
  });
};

/**
 * Get friendly error message based on error type
 * @param error - The error object
 * @returns Friendly error message
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;

  // Handle Axios errors
  if (error.message && error.message.includes("Network Error")) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Extract error message from response if available
  if (error.response) {
    const { status, data } = error.response;

    // Common HTTP status codes
    if (status === 401) return "Authentication required. Please log in again.";
    if (status === 403)
      return "You do not have permission to access this resource.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 500) return "Server error. Please try again later.";

    // Extract message from response data
    if (data) {
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (typeof data === "string") return data;
    }
  }

  // Use error message if available
  return error.message || "An unknown error occurred";
};
