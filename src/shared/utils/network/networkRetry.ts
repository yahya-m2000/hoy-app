import NetInfo from '@react-native-community/netinfo';

// Track failed network requests for retry
let networkFailedQueue: (() => void)[] = [];

/**
 * Process network failed queue when connection is restored
 */
export const processNetworkQueue = () => {
  if (networkFailedQueue.length > 0) {
    console.log(`Retrying ${networkFailedQueue.length} requests after network reconnection`);
    
    const queueToProcess = [...networkFailedQueue];
    networkFailedQueue = [];
    
    queueToProcess.forEach(request => {
      try {
        request();
      } catch (error) {
        console.error('Error retrying request:', error);
      }
    });
  }
};

/**
 * Setup network detection to automatically retry failed requests
 */
export const setupNetworkMonitoring = () => {
  // Set up network state listener
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable !== false) {
      // Network is back - process any queued requests
      processNetworkQueue();
    }
  });
};

/**
 * Add a failed request to the retry queue
 */
export const addToRetryQueue = (retryFunction: () => void) => {
  networkFailedQueue.push(retryFunction);
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('Network Error') ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  );
};

// Initialize network monitoring
setupNetworkMonitoring();
