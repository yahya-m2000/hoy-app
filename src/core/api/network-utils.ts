/**
 * Network Utilities
 * Handles network connectivity checks and network-related operations
 */

import NetInfo from "src/core/utils/network/network-info";
import { logger } from "../utils/sys/log/logger";

/**
 * Checks if device has internet connection
 */
export const checkConnection = async (): Promise<void> => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
    throw new Error("Network Error: No internet connection available");
  }
};

/**
 * Gets current network information
 */
export const getNetworkInfo = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected,
      isInternetReachable: netInfo.isInternetReachable,
      type: netInfo.type,
      details: netInfo.details,
    };
  } catch (error) {
    logger.error("Error getting network info:", error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
      details: null,
    };
  }
};

/**
 * Waits for network connection to be available
 */
export const waitForConnection = async (timeoutMs: number = 10000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable !== false) {
        return true;
      }
    } catch (error) {
      logger.warn("Error checking connection:", error);
    }
    
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
};

/**
 * Monitors network connection changes
 */
export const monitorNetworkChanges = (
  onConnected: () => void,
  onDisconnected: () => void
) => {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable !== false) {
      onConnected();
    } else {
      onDisconnected();
    }
  });
}; 