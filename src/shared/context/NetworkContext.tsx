import React, { createContext, useContext, useState, useEffect } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { Alert } from "react-native";

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  retryFailedRequests: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  retryFailedRequests: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);
  const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reconnected, setReconnected] = useState(false);

  // Track failed requests that can be retried
  const [failedRequests, setFailedRequests] = useState<(() => void)[]>([]);

  // Add a request to the retry queue
  // const addRetryRequest = (request: () => void) => {
  //   setFailedRequests((prev) => [...prev, request]);
  // };

  // Retry all failed requests
  const retryFailedRequests = () => {
    if (failedRequests.length > 0) {
      failedRequests.forEach((request) => request());
      setFailedRequests([]);
    }
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
      console.log("Network connection restored");
      setReconnected(true);
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
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
