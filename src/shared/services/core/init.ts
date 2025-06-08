import { Platform } from "react-native";
import { setupApiInterceptors } from "./interceptors";
import "@shared/utils/network/networkRetry"; // Initialize network monitoring

// Add a console message showing the platform info
console.log(`[API INIT] Initializing API for platform: ${Platform.OS}`);

// Set up API interceptors for token refresh and error handling
setupApiInterceptors();

// Log when initialization is complete
console.log("[API INIT] API interceptors initialized successfully");

export default {
  isInitialized: true,
  platform: Platform.OS,
};
