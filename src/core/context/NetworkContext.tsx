/**
 * Network Context
 * Provides network state and connectivity information to the app
 *
 * @module @core/context/NetworkContext
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import NetInfo, { NetInfoState } from "@core/utils/network/network-info";
import { Alert } from "react-native";
import { logger } from "../utils/sys/log";
import {
  processNetworkQueue,
  getRetryQueueStats,
  clearRetryQueue,
  initializeGlobalNetworkMonitoring,
  cleanupGlobalNetworkMonitoring,
} from "../utils/network/retry-handler";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  retryFailedRequests: () => void;
  getQueueStats: () => ReturnType<typeof getRetryQueueStats>;
  clearQueue: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  retryFailedRequests: () => {},
  getQueueStats: () => ({ queueSize: 0, isProcessing: false, requests: [] }),
  clearQueue: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

const NetworkProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);
  const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);
  const [reconnected, setReconnected] = useState(false);

  // Initialize global network monitoring on mount
  useEffect(() => {
    initializeGlobalNetworkMonitoring();

    return () => {
      cleanupGlobalNetworkMonitoring();
    };
  }, []);

  // Retry all failed requests using global queue
  const retryFailedRequests = () => {
    logger.log("[NetworkContext] Manually triggering retry queue processing");
    processNetworkQueue();
  };

  // Get queue statistics
  const getQueueStats = () => {
    return getRetryQueueStats();
  };

  // Clear retry queue
  const clearQueue = () => {
    logger.log("[NetworkContext] Manually clearing retry queue");
    clearRetryQueue();
  };

  useEffect(() => {
    // Initial connectivity check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected === true);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state);
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle connectivity changes
  const handleConnectivityChange = (state: NetInfoState) => {
    const connected = state.isConnected === true;
    const reachable = state.isInternetReachable === true;

    setIsConnected(connected);
    setIsInternetReachable(reachable);

    // Handle offline scenario
    if (!connected && !hasShownOfflineAlert) {
      Alert.alert(
        "You're offline",
        "Please check your internet connection to use all app features.",
        [{ text: "OK", onPress: () => setHasShownOfflineAlert(true) }]
      );
      setHasShownOfflineAlert(true);
    }

    // Handle reconnection
    if (connected && reachable && !isConnected) {
      logger.log("[NetworkContext] Network connection restored");
      setReconnected(true);

      // The global retry handler will automatically process the queue
      // but we can also trigger it manually for immediate processing
      retryFailedRequests();

      // Reset alert flag so it can show again after next disconnection
      setHasShownOfflineAlert(false);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        retryFailedRequests,
        getQueueStats,
        clearQueue,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Network"
    critical={false}
    enableRetry={true}
    maxRetries={3}
    onError={(error, errorInfo, contextName) => {
      logger.error(`[${contextName}] Context error:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        module: "NetworkProvider",
      });
    }}
  >
    <NetworkProviderInternal>{children}</NetworkProviderInternal>
  </ContextErrorBoundary>
);

export default NetworkContext;
