/**
 * API Interceptors
 * Enhanced interceptor setup with circuit breaker integration, input sanitization, and rate limiting
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventEmitter, AppEvents } from "src/core/utils/sys/event-emitter";
import { isNetworkError, addToRetryQueue } from "@core/utils/network";
import { isPublicEndpoint } from './endpoints';
import { clearAuthenticationData, refreshAccessToken } from './auth-manager';
import { saveTokenToStorage, saveRefreshTokenToStorage } from '@core/auth/storage';
import { classifyError } from '../config/api.config';
import { 
  shouldAllowRequest, 
  recordSuccess, 
  recordFailure, 
  getCircuitBreakerState,
  CircuitBreakerState 
} from './circuit-breaker';
import { addSignatureHeaders } from './request-signing';
import { setupCertificatePinningInterceptors } from './certificate-pinning-interceptor';
import { setupAuthTokenInterceptor } from './auth-token-interceptor';
import { setupApiKeyInterceptor } from './api-key-interceptor';
import api from './client';
import { logger } from "../utils/sys/log";

// ========================================
// TYPE DECLARATIONS
// ========================================

/**
 * Request metadata interface
 */
interface RequestMetadata {
  startTime: number;
  endpoint: string;
}

/**
 * Enhanced request interceptor with circuit breaker integration
 */
const setupRequestInterceptor = () => {
  api.interceptors.request.use(
    (config) => {
      // Check circuit breaker before allowing request
      const url = config.url || '';
      const fullUrl = config.baseURL ? `${config.baseURL}${url}` : url;
      
      if (!shouldAllowRequest(fullUrl)) {
        const state = getCircuitBreakerState(fullUrl);
        const error = new Error(`Circuit breaker ${state}: Request blocked for ${url}`);
        error.name = 'CircuitBreakerError';
        (error as any).circuitBreakerState = state;
        (error as any).endpoint = url;
        
        logger.warn(`Circuit breaker blocked request to ${url}`, {
          state,
          endpoint: url,
        }, {
          module: 'CircuitBreaker'
        });
        
        throw error;
      }

      // Add HMAC request signing (synchronous version)
      try {
        // Call synchronous version of addSignatureHeaders
        const method = config.method || 'GET';
        const fullRequestUrl = config.baseURL ? `${config.baseURL}${url}` : url;
        const headers = config.headers || {};
        const body = config.data;

        // Import and use synchronous signature generation
        const { generateRequestSignature } = require('./request-signing');
        const signatureData = generateRequestSignature(method, fullRequestUrl, headers, body);
        
        // Add signature headers
        config.headers = {
          ...headers,
          'X-Request-Signature': signatureData.signature,
          'X-Request-Timestamp': signatureData.timestamp,
          'X-Request-Nonce': signatureData.nonce,
          'X-Secret-Id': signatureData.secretId,
        };
      } catch (signingError) {
        logger.error("Failed to add request signature:", signingError, {
          module: 'RequestSigning'
        });
        // Continue without signature in case of error (fallback)
      }

      // Add request timestamp for metrics
      (config as any).metadata = {
        startTime: Date.now(),
        endpoint: url,
      };
      
      return config;
    },
    (error) => {
      logger.error("Request interceptor error:", error, {
        module: 'ApiInterceptors'
      });
      return Promise.reject(error);
    }
  );
};

/**
 * Enhanced response interceptor with circuit breaker integration
 */
const setupResponseInterceptor = () => {
  api.interceptors.response.use(
    (response) => {
      // Record successful request for circuit breaker
      const config = response.config as any;
      if (config?.metadata?.endpoint) {
        const fullUrl = config.baseURL ? `${config.baseURL}${config.metadata.endpoint}` : config.metadata.endpoint;
        recordSuccess(fullUrl);
        
        // Log performance metrics in development
        if (__DEV__ && config.metadata?.startTime) {
          const duration = Date.now() - config.metadata.startTime;
          logger.debug(`API success: ${config.metadata.endpoint} (${duration}ms)`, {
            endpoint: config.metadata.endpoint,
            duration,
            status: response.status,
          }, {
            module: 'ApiInterceptors'
          });
        }
      }
      
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Record failure for circuit breaker
      const originalRequestWithMetadata = originalRequest as any;
      if (originalRequestWithMetadata?.metadata?.endpoint) {
        const fullUrl = originalRequestWithMetadata.baseURL ? 
          `${originalRequestWithMetadata.baseURL}${originalRequestWithMetadata.metadata.endpoint}` : 
          originalRequestWithMetadata.metadata.endpoint;
        
        // Only record failure for actual server errors, not circuit breaker blocks, certificate pinning errors, auth failures, or rate limits
        const shouldRecordFailure = error.name !== 'CircuitBreakerError' && 
          error.name !== 'CertificatePinningError' &&
          // Don't record auth failures (401/403) as circuit breaker failures
          !(error.response?.status === 401 || error.response?.status === 403) &&
          // Don't record rate limit (429) as circuit breaker failures
          error.response?.status !== 429;
          
        if (shouldRecordFailure) {
          recordFailure(fullUrl);
        }
        
        // Log error metrics in development
        if (__DEV__ && originalRequestWithMetadata.metadata?.startTime) {
          const duration = Date.now() - originalRequestWithMetadata.metadata.startTime;
          logger.debug(`API error: ${originalRequestWithMetadata.metadata.endpoint} (${duration}ms)`, {
            endpoint: originalRequestWithMetadata.metadata.endpoint,
            duration,
            status: error.response?.status,
            error: error.message,
          }, {
            module: 'ApiInterceptors'
          });
        }
      }

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Handle circuit breaker errors
      if (error.name === 'CircuitBreakerError') {
        return Promise.reject(error);
      }

      // Handle certificate pinning errors (not retryable)
      if (error.name === 'CertificatePinningError') {
        logger.error("[ApiInterceptors] Certificate pinning error - request blocked", {
          endpoint: (originalRequest as any).metadata?.endpoint,
          domain: error.domain,
          error: error.message,
        }, {
          module: 'ApiInterceptors'
        });
        return Promise.reject(error);
      }

      // Handle network errors
      if (isNetworkError(error)) {
        const retryFn = async () => {
          logger.debug("[ApiInterceptors] Retrying previously failed request");
          return api(originalRequest);
        };

        try {
          addToRetryQueue(retryFn, error, {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            exponentialBackoff: true,
            retryCondition: (err) => isNetworkError(err)
          });
          
          logger.info("[ApiInterceptors] Request will be retried when network connection is restored");
        } catch (retryError) {
          logger.warn("[ApiInterceptors] Request not queued for retry", { reason: retryError });
        }
        
        return Promise.reject(error);
      }

      // Classify error for handling strategy
      const errorClassification = classifyError(error);
      
      // Handle authentication errors (401)
      if (error.response?.status === 401 && !originalRequest._retry) {
        return handleAuthError(error, originalRequest);
      }

      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        return handleRateLimitError(error, originalRequest);
      }

      // Handle server errors (5xx) with retry
      if (errorClassification.retry && errorClassification.type === 'server') {
        return handleServerError(error, originalRequest);
      }

      return Promise.reject(error);
    }
  );
};

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Handles authentication errors with token refresh
 */
const handleAuthError = async (error: any, originalRequest: any) => {
  // Skip refresh for public endpoints
  if (originalRequest.url && isPublicEndpoint(originalRequest.url, originalRequest.method)) {
    return Promise.reject(error);
  }

  // Check if error indicates token expiration
  const responseData = error.response?.data;
  const isTokenExpired = 
    responseData?.message?.includes("expired") ||
    responseData?.message === "Token expired" ||
    responseData?.message === "jwt expired" ||
    error.response?.status === 401;

  if (!isTokenExpired || originalRequest._retry) {
    return Promise.reject(error);
  }

  // Mark request as retried
  originalRequest._retry = true;

  if (!isRefreshing) {
    isRefreshing = true;

    try {
      // Attempt to refresh the token
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        // Save new token (refresh token is handled internally by refreshAccessToken)
        await saveTokenToStorage(newAccessToken);

        // Notify all waiting requests
        onTokenRefreshed(newAccessToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        // Refresh failed, but refreshAccessToken already handles clearing auth data appropriately
        isRefreshing = false;
        return Promise.reject(error);
      }
    } catch (refreshError: any) {
      // Refresh failed, but refreshAccessToken already handles clearing auth data appropriately
      isRefreshing = false;
      return Promise.reject(error);
    }
  }

  // Wait for token refresh to complete
  return new Promise((resolve, reject) => {
    subscribeTokenRefresh((token: string) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      resolve(api(originalRequest));
    });
  });
};

/**
 * Handles rate limiting errors with exponential backoff
 */
const handleRateLimitError = async (error: any, originalRequest: any) => {
  const retryAfter = error.response?.headers['retry-after'];
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, originalRequest._retryCount || 0) * 1000;
  
  originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
  
  if (originalRequest._retryCount <= 3) {
    logger.warn(`Rate limited. Retrying after ${delay}ms...`, {
      endpoint: (originalRequest as any).metadata?.endpoint,
      retryCount: originalRequest._retryCount,
      delay,
    }, {
      module: 'ApiInterceptors'
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return api(originalRequest);
  }
  
  logger.error("Rate limit retry exhausted", {
    endpoint: (originalRequest as any).metadata?.endpoint,
    retryCount: originalRequest._retryCount,
  }, {
    module: 'ApiInterceptors'
  });
  
  return Promise.reject(error);
};

/**
 * Handles server errors with retry logic
 */
const handleServerError = async (error: any, originalRequest: any) => {
  originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
  
  if (originalRequest._retryCount <= 2) {
    const delay = Math.pow(2, originalRequest._retryCount) * 1000;
    
    logger.warn(`Server error. Retrying after ${delay}ms...`, {
      endpoint: (originalRequest as any).metadata?.endpoint,
      retryCount: originalRequest._retryCount,
      delay,
      status: error.response?.status,
    }, {
      module: 'ApiInterceptors'
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return api(originalRequest);
  }
  
  logger.error("Server error retry exhausted", {
    endpoint: (originalRequest as any).metadata?.endpoint,
    retryCount: originalRequest._retryCount,
    status: error.response?.status,
  }, {
    module: 'ApiInterceptors'
  });
  
  return Promise.reject(error);
};

/**
 * Setup streamlined API interceptors for production-ready mobile app
 * Focuses on essential security and session management
 */
export const setupApiInterceptors = () => {
  logger.info("[INTERCEPTORS] Setting up streamlined API interceptors...", undefined, {
    module: 'ApiInterceptors'
  });
  
  // 1. Certificate pinning (highest security priority - MITM protection)
  setupCertificatePinningInterceptors(api);
  
  // 2. Auth token attachment (adds Bearer access token)
  setupAuthTokenInterceptor(api);
  
  // 3. API key management (only for external providers)
  setupApiKeyInterceptor(api);
  
  // 4. Core request/response logic (circuit breaker, request signing, error handling)
  setupRequestInterceptor();
  setupResponseInterceptor();
  
  logger.info("[INTERCEPTORS] Streamlined API interceptors initialized successfully", undefined, {
    module: 'ApiInterceptors'
  });
};