/**
 * API Initialization
 * Sets up API interceptors, network monitoring, and token caching for the application
 */

import { Platform } from "react-native";
import { setupApiInterceptors } from "./interceptors";
import { initializeAuthManager } from "./auth-manager";
import { initializeGlobalNetworkMonitoring } from "../utils/network/retry-handler";
import { logger } from "../utils/sys/log/logger";

/**
 * Initialize API and authentication systems
 */
const initializeAPI = async () => {
  try {
    // Add a logger message showing the platform info
    logger.log(`[API INIT] Initializing API for platform: ${Platform.OS}`);

    // Set up API interceptors for token refresh and error handling (SYNCHRONOUS)
    setupApiInterceptors();
    logger.log("[API INIT] API interceptors initialized successfully");

    // Initialize authentication manager with token caching
    await initializeAuthManager();
    logger.log("[API INIT] Authentication manager with token caching initialized");

    // Initialize global network monitoring and retry mechanism
    initializeGlobalNetworkMonitoring();
    logger.log("[API INIT] Network monitoring and retry mechanism initialized");

    logger.log("[API INIT] Complete API initialization finished successfully");
    
    return {
      isInitialized: true,
      platform: Platform.OS,
      tokenCacheEnabled: true,
      retryMechanismEnabled: true,
    };
  } catch (error) {
    logger.error("[API INIT] Failed to initialize API systems", error);
    
    // Return partial initialization status
    return {
      isInitialized: false,
      platform: Platform.OS,
      tokenCacheEnabled: false,
      retryMechanismEnabled: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ========================================
// IMMEDIATE INITIALIZATION
// ========================================

// Initialize interceptors immediately (synchronous)
try {
  logger.log(`[API INIT] Immediate initialization for platform: ${Platform.OS}`);
  setupApiInterceptors();
  logger.log("[API INIT] ✅ API interceptors initialized immediately");
} catch (error) {
  logger.error("[API INIT] ❌ Failed to initialize API interceptors immediately", error);
}

// Initialize the rest asynchronously
const initResult = initializeAPI();

export default initResult;
