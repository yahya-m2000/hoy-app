/**
 * CSRF Token Manager
 * 
 * Handles CSRF token fetching, caching, and management for API requests.
 * Prevents Cross-Site Request Forgery attacks by including CSRF tokens
 * in all non-GET requests to the server.
 * 
 * Features:
 * - Automatic token fetching and caching
 * - Token refresh on expiration
 * - Secure token storage
 * - Performance optimization with caching
 * - Error handling and retry logic
 * - Development mode debugging
 * 
 * @module @core/security/csrf-token-manager
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@core/utils/sys/log';
import { api } from '@core/api/client';

// Helper functions for safe AsyncStorage usage
const safeGetItem = async (storage: typeof AsyncStorage, key: string): Promise<string | null> => {
  if (storage && typeof storage.getItem === 'function') {
    return await storage.getItem(key);
  }
  return null;
};
const safeSetItem = async (storage: typeof AsyncStorage, key: string, value: string): Promise<void> => {
  if (storage && typeof storage.setItem === 'function') {
    await storage.setItem(key, value);
  }
};
const safeRemoveItem = async (storage: typeof AsyncStorage, key: string): Promise<void> => {
  if (storage && typeof storage.removeItem === 'function') {
    await storage.removeItem(key);
  }
};

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface CsrfTokenResponse {
  csrfToken: string;
  message: string;
}

export interface CsrfTokenInfo {
  token: string;
  fetchedAt: number;
  expiresAt?: number;
}

export interface CsrfManagerConfig {
  enabled: boolean;
  cacheKey: string;
  tokenEndpoint: string;
  tokenHeader: string;
  cacheTimeout: number;        // Token cache timeout in ms
  retryAttempts: number;       // Number of retry attempts for token fetch
  retryDelay: number;          // Delay between retries in ms
}

export interface CsrfManagerStats {
  tokensGenerated: number;
  tokensFetched: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  lastTokenFetch: number;
  lastError?: string;
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: CsrfManagerConfig = {
  enabled: true,
  cacheKey: 'csrf_token_cache',
  tokenEndpoint: '/api/v1/auth/csrf-token',
  tokenHeader: 'X-CSRF-Token',
  cacheTimeout: 30 * 60 * 1000, // 30 minutes
  retryAttempts: 3,
  retryDelay: 1000,
};

// ========================================
// CSRF TOKEN MANAGER CLASS
// ========================================

export class CsrfTokenManager {
  private config: CsrfManagerConfig;
  private tokenCache: CsrfTokenInfo | null = null;
  private fetchPromise: Promise<string> | null = null;
  private stats: CsrfManagerStats;

  constructor(config: Partial<CsrfManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      tokensGenerated: 0,
      tokensFetched: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastTokenFetch: 0,
    };

    // Load cached token on initialization
    this.loadCachedToken();
  }

  /**
   * Get CSRF token (with caching and automatic refresh)
   */
  public async getToken(): Promise<string | null> {
    try {
      if (!this.config.enabled) {
        return null;
      }

      // Check if we have a valid cached token
      if (this.tokenCache && this.isTokenValid(this.tokenCache)) {
        this.stats.cacheHits++;
        return this.tokenCache.token;
      }

      this.stats.cacheMisses++;

      // If there's already a fetch in progress, wait for it
      if (this.fetchPromise) {
        return await this.fetchPromise;
      }

      // Fetch new token
      this.fetchPromise = this.fetchNewToken();
      const token = await this.fetchPromise;
      this.fetchPromise = null;

      return token;

    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('[CsrfTokenManager] Failed to get CSRF token:', error, {
        module: 'CsrfTokenManager'
      });

      // Return null to allow requests to proceed without CSRF token
      // (server will handle this appropriately)
      return null;
    }
  }

  /**
   * Check if request needs CSRF token
   */
  public needsCsrfToken(method: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    // CSRF tokens are needed for all non-GET requests
    const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
    return !safeMethod;
  }

  /**
   * Get CSRF token header name
   */
  public getTokenHeader(): string {
    return this.config.tokenHeader;
  }

  /**
   * Clear cached token (force refresh on next request)
   */
  public async clearToken(): Promise<void> {
    try {
      this.tokenCache = null;
      await safeRemoveItem(AsyncStorage, this.config.cacheKey);
      
      logger.debug('[CsrfTokenManager] Token cache cleared', undefined, {
        module: 'CsrfTokenManager'
      });
    } catch (error) {
      logger.error('[CsrfTokenManager] Failed to clear token cache:', error, {
        module: 'CsrfTokenManager'
      });
    }
  }

  /**
   * Get manager statistics
   */
  public getStats(): CsrfManagerStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      tokensGenerated: 0,
      tokensFetched: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastTokenFetch: 0,
    };
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Fetch new CSRF token from server
   */
  private async fetchNewToken(): Promise<string> {
    const startTime = Date.now();

    try {
      logger.debug('[CsrfTokenManager] Fetching new CSRF token', undefined, {
        module: 'CsrfTokenManager'
      });

      const response = await this.retryTokenFetch();
      
      if (!response.data?.csrfToken) {
        throw new Error('Invalid CSRF token response');
      }

      const tokenInfo: CsrfTokenInfo = {
        token: response.data.csrfToken,
        fetchedAt: Date.now(),
        expiresAt: Date.now() + this.config.cacheTimeout,
      };

      // Cache the token
      this.tokenCache = tokenInfo;
      await safeSetItem(AsyncStorage, this.config.cacheKey, JSON.stringify(tokenInfo));

      this.stats.tokensFetched++;
      this.stats.tokensGenerated++;
      this.stats.lastTokenFetch = Date.now();

      logger.debug('[CsrfTokenManager] CSRF token fetched successfully', {
        fetchTime: Date.now() - startTime,
        tokenLength: tokenInfo.token.length
      }, {
        module: 'CsrfTokenManager'
      });

      return tokenInfo.token;

    } catch (error) {
      logger.error('[CsrfTokenManager] Failed to fetch CSRF token:', error, {
        module: 'CsrfTokenManager'
      });
      throw error;
    }
  }

  /**
   * Retry token fetch with exponential backoff
   */
  private async retryTokenFetch(): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Use a direct axios call to avoid circular dependency with interceptors
        const response = await api.get(this.config.tokenEndpoint);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          logger.debug(`[CsrfTokenManager] Retry ${attempt}/${this.config.retryAttempts} failed, waiting ${delay}ms`, undefined, {
            module: 'CsrfTokenManager'
          });
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Failed to fetch CSRF token after retries');
  }

  /**
   * Check if cached token is still valid
   */
  private isTokenValid(tokenInfo: CsrfTokenInfo): boolean {
    if (!tokenInfo.token) {
      return false;
    }

    const now = Date.now();
    
    // Check if token has expired
    if (tokenInfo.expiresAt && now > tokenInfo.expiresAt) {
      return false;
    }

    // Check if token is too old (fallback check)
    const age = now - tokenInfo.fetchedAt;
    if (age > this.config.cacheTimeout) {
      return false;
    }

    return true;
  }

  /**
   * Load cached token from storage
   */
  private async loadCachedToken(): Promise<void> {
    try {
      if (!AsyncStorage) {
        logger.warn('[CsrfTokenManager] AsyncStorage is not available, cannot load cached token.', undefined, {
          module: 'CsrfTokenManager'
        });
        return;
      }

      const cached = await safeGetItem(AsyncStorage, this.config.cacheKey);
      if (cached) {
        const tokenInfo: CsrfTokenInfo = JSON.parse(cached);
        if (this.isTokenValid(tokenInfo)) {
          this.tokenCache = tokenInfo;
          logger.debug('[CsrfTokenManager] Loaded valid cached token', undefined, {
            module: 'CsrfTokenManager'
          });
        } else {
          // Remove expired token
          await safeRemoveItem(AsyncStorage, this.config.cacheKey);
          logger.debug('[CsrfTokenManager] Removed expired cached token', undefined, {
            module: 'CsrfTokenManager'
          });
        }
      }
    } catch (error) {
      logger.error('[CsrfTokenManager] Failed to load cached token:', error, {
        module: 'CsrfTokenManager'
      });
    }
  }

  /**
   * Save token to cache
   */
  private async saveCachedToken(tokenInfo: CsrfTokenInfo): Promise<void> {
    try {
      if (!AsyncStorage) {
        logger.warn('[CsrfTokenManager] AsyncStorage is not available, cannot save token to cache.', undefined, {
          module: 'CsrfTokenManager'
        });
        return;
      }
      await safeSetItem(AsyncStorage, this.config.cacheKey, JSON.stringify(tokenInfo));
    } catch (error) {
      logger.error('[CsrfTokenManager] Failed to save token to cache:', error, {
        module: 'CsrfTokenManager'
      });
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const csrfTokenManager = new CsrfTokenManager();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Get CSRF token for use in API requests
 */
export const getCsrfToken = async (): Promise<string | null> => {
  return await csrfTokenManager.getToken();
};

/**
 * Check if method needs CSRF token
 */
export const needsCsrfToken = (method: string): boolean => {
  return csrfTokenManager.needsCsrfToken(method);
};

/**
 * Get CSRF token header name
 */
export const getCsrfTokenHeader = (): string => {
  return csrfTokenManager.getTokenHeader();
};

/**
 * Clear CSRF token cache
 */
export const clearCsrfToken = async (): Promise<void> => {
  return await csrfTokenManager.clearToken();
}; 