import { logger } from "../sys/log";
import NetInfo from "./network-info";

// ========================================
// TYPES & INTERFACES
// ========================================

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryCondition?: (error: unknown) => boolean;
}

export interface QueuedRequest {
  id: string;
  retryFunction: () => Promise<unknown>;
  retryCount: number;
  originalError: unknown;
  timestamp: number;
  config: RetryConfig;
}

// ========================================
// RETRY QUEUE MANAGEMENT
// ========================================

// Track failed network requests for retry
let networkFailedQueue: QueuedRequest[] = [];
let isProcessingQueue = false;
let globalRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
};

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (retryCount: number, config: RetryConfig): number => {
  if (!config.exponentialBackoff) {
    return config.baseDelay;
  }
  
  const delay = config.baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, config.maxDelay);
};

/**
 * Process network failed queue when connection is restored
 */
export const processNetworkQueue = async (): Promise<void> => {
  if (isProcessingQueue || networkFailedQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  
  logger.log(
    `[RetryHandler] Processing ${networkFailedQueue.length} queued requests after network reconnection`
  );

  const queueToProcess = [...networkFailedQueue];
  networkFailedQueue = [];
  
  const results = await Promise.allSettled(
    queueToProcess.map(async (queuedRequest) => {
      try {
        const delay = calculateDelay(queuedRequest.retryCount, queuedRequest.config);
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
        
        logger.debug(`[RetryHandler] Retrying request ${queuedRequest.id} (attempt ${queuedRequest.retryCount + 1})`);
        
        await queuedRequest.retryFunction();
        
        logger.debug(`[RetryHandler] Request ${queuedRequest.id} retry successful`);
        
      } catch (error) {
        logger.warn(`[RetryHandler] Request ${queuedRequest.id} retry failed`, 
          { error: error instanceof Error ? error.message : 'Unknown error' });
        
        // Re-queue if under retry limit
        if (queuedRequest.retryCount < queuedRequest.config.maxRetries) {
          const updatedRequest: QueuedRequest = {
            ...queuedRequest,
            retryCount: queuedRequest.retryCount + 1,
          };
          networkFailedQueue.push(updatedRequest);
        } else {
          logger.error(`[RetryHandler] Request ${queuedRequest.id} exceeded max retries (${queuedRequest.config.maxRetries})`, 
            { originalError: queuedRequest.originalError });
        }
        
        throw error;
      }
    })
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  
  logger.log(`[RetryHandler] Queue processing complete: ${successful} successful, ${failed} failed`);
  
  isProcessingQueue = false;
  
  // Process any newly queued requests
  if (networkFailedQueue.length > 0) {
    setTimeout(() => processNetworkQueue(), 1000);
  }
};

/**
 * Setup network detection to automatically retry failed requests
 * Returns cleanup function to prevent memory leaks
 */
export const setupNetworkMonitoring = (): (() => void) => {
  logger.log("[RetryHandler] Setting up network monitoring for retry mechanism");
  
  // Set up network state listener
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      logger.log("[RetryHandler] Network connection restored, processing retry queue");
      processNetworkQueue();
    }
  });

  // Return cleanup function
  return unsubscribe;
};

/**
 * Add a failed request to the retry queue
 */
export const addToRetryQueue = (
  retryFunction: () => Promise<unknown>, 
  error: unknown = null,
  customConfig?: Partial<RetryConfig>
): string => {
  const config = { ...globalRetryConfig, ...customConfig };
  
  // Check retry condition if provided
  if (config.retryCondition && !config.retryCondition(error)) {
    logger.debug("[RetryHandler] Request not added to retry queue: retry condition not met");
    throw new Error("Retry condition not met");
  }
  
  const queuedRequest: QueuedRequest = {
    id: generateRequestId(),
    retryFunction,
    retryCount: 0,
    originalError: error,
    timestamp: Date.now(),
    config,
  };
  
  networkFailedQueue.push(queuedRequest);
  
  logger.log(`[RetryHandler] Added request ${queuedRequest.id} to retry queue (queue size: ${networkFailedQueue.length})`);
  
  return queuedRequest.id;
};

/**
 * Remove a request from the retry queue
 */
export const removeFromRetryQueue = (requestId: string): boolean => {
  const initialLength = networkFailedQueue.length;
  networkFailedQueue = networkFailedQueue.filter(req => req.id !== requestId);
  
  const removed = initialLength > networkFailedQueue.length;
  if (removed) {
    logger.debug(`[RetryHandler] Removed request ${requestId} from retry queue`);
  }
  
  return removed;
};

/**
 * Get retry queue statistics
 */
export const getRetryQueueStats = () => {
  return {
    queueSize: networkFailedQueue.length,
    isProcessing: isProcessingQueue,
    requests: networkFailedQueue.map(req => ({
      id: req.id,
      retryCount: req.retryCount,
      timestamp: req.timestamp,
      maxRetries: req.config.maxRetries,
    })),
  };
};

/**
 * Clear the retry queue
 */
export const clearRetryQueue = (): void => {
  const clearedCount = networkFailedQueue.length;
  networkFailedQueue = [];
  
  logger.log(`[RetryHandler] Cleared retry queue (${clearedCount} requests removed)`);
};

/**
 * Update global retry configuration
 */
export const updateRetryConfig = (newConfig: Partial<RetryConfig>): void => {
  globalRetryConfig = { ...globalRetryConfig, ...newConfig };
  
  logger.log("[RetryHandler] Updated global retry configuration", 
    { config: globalRetryConfig });
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  const err = error as any;
  
  return (
    err?.message?.includes("Network Error") ||
    err?.message?.includes("network error") ||
    err?.code === "ECONNABORTED" ||
    err?.code === "ERR_NETWORK" ||
    err?.code === "NETWORK_ERROR" ||
    err?.code === "TIMEOUT" ||
    !err?.response
  );
};

// ========================================
// GLOBAL MONITORING SETUP
// ========================================

// Initialize network monitoring - but don't auto-start to prevent leaks
let globalNetworkCleanup: (() => void) | null = null;

/**
 * Initialize global network monitoring (call once at app startup)
 */
export const initializeGlobalNetworkMonitoring = (): void => {
  if (!globalNetworkCleanup) {
    globalNetworkCleanup = setupNetworkMonitoring();
    logger.log("[RetryHandler] Global network monitoring initialized");
  }
};

/**
 * Cleanup global network monitoring (call at app shutdown)
 */
export const cleanupGlobalNetworkMonitoring = (): void => {
  if (globalNetworkCleanup) {
    globalNetworkCleanup();
    globalNetworkCleanup = null;
    clearRetryQueue();
    logger.log("[RetryHandler] Global network monitoring cleaned up");
  }
};
