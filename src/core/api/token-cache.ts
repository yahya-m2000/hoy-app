/**
 * Token Cache System for Offline Validation
 * 
 * Eliminates JWT decoding overhead by caching token expiry times
 * and providing fast offline validation without parsing tokens
 * 
 * @module @core/api/token-cache
 * @author Hoy Development Team
 * @version 1.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../utils/sys/log";

// ========================================
// TYPES & INTERFACES
// ========================================

interface TokenCacheEntry {
  /** Token hash for verification */
  tokenHash: string;
  /** Expiration timestamp in milliseconds */
  expiresAt: number;
  /** Token type (access or refresh) */
  tokenType: 'access' | 'refresh';
  /** Cache timestamp */
  cachedAt: number;
  /** Token payload data (optional, for quick access) */
  payload?: {
    userId?: string;
    role?: string;
    sessionId?: string;
  };
}

interface TokenValidationResult {
  /** Whether token is valid and not expired */
  isValid: boolean;
  /** Whether token exists in cache */
  isCached: boolean;
  /** Minutes until expiration (if valid) */
  expiresInMinutes?: number;
  /** Expiration timestamp */
  expiresAt?: number;
  /** Validation method used */
  method: 'cache' | 'decode' | 'error';
  /** Error message if validation failed */
  error?: string;
}

// ========================================
// CACHE CONFIGURATION
// ========================================

const CACHE_KEYS = {
  ACCESS_TOKEN_CACHE: 'token_cache_access',
  REFRESH_TOKEN_CACHE: 'token_cache_refresh',
  CACHE_VERSION: 'token_cache_version',
} as const;

const CACHE_CONFIG = {
  VERSION: '1.0.0',
  MAX_CACHE_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  EXPIRY_BUFFER_MS: 60 * 1000, // 1 minute buffer before actual expiry
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour cleanup interval
} as const;

// ========================================
// CACHE MANAGEMENT
// ========================================

/**
 * Generate a simple hash for token verification
 */
const generateTokenHash = (token: string): string => {
  // Simple hash based on token length and first/last characters
  // This is not cryptographic, just for cache verification
  const start = token.substring(0, 8);
  const end = token.substring(token.length - 8);
  const length = token.length;
  return `${start}_${length}_${end}`;
};

/**
 * Parse JWT token to extract expiration time
 * This is the expensive operation we want to cache
 */
const parseTokenExpiry = (token: string): { expiresAt: number; payload?: any } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1]));
    
    if (!payload.exp) {
      throw new Error('No expiration time in token');
    }

    return {
      expiresAt: payload.exp * 1000, // Convert to milliseconds
      payload: {
        userId: payload.userId,
        role: payload.role,
        sessionId: payload.sessionId,
      }
    };
  } catch (error) {
    logger.warn('Failed to parse token expiry', error, { module: 'TokenCache' });
    return null;
  }
};

/**
 * Cache token expiry information
 */
export const cacheTokenExpiry = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<boolean> => {
  try {
    const parsedToken = parseTokenExpiry(token);
    if (!parsedToken) {
      return false;
    }

    const cacheEntry: TokenCacheEntry = {
      tokenHash: generateTokenHash(token),
      expiresAt: parsedToken.expiresAt,
      tokenType,
      cachedAt: Date.now(),
      payload: parsedToken.payload,
    };

    const cacheKey = tokenType === 'access' 
      ? CACHE_KEYS.ACCESS_TOKEN_CACHE 
      : CACHE_KEYS.REFRESH_TOKEN_CACHE;

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    
    logger.debug(`Token expiry cached for ${tokenType} token`, {
      expiresAt: new Date(parsedToken.expiresAt).toISOString(),
      expiresInMinutes: Math.round((parsedToken.expiresAt - Date.now()) / 60000)
    }, { module: 'TokenCache' });

    return true;
  } catch (error) {
    logger.error('Failed to cache token expiry', error, { module: 'TokenCache' });
    return false;
  }
};

/**
 * Validate token using cached expiry (fast offline validation)
 */
export const validateTokenFromCache = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<TokenValidationResult> => {
  try {
    const cacheKey = tokenType === 'access' 
      ? CACHE_KEYS.ACCESS_TOKEN_CACHE 
      : CACHE_KEYS.REFRESH_TOKEN_CACHE;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      // No cache found, need to decode token
      return await validateTokenWithDecode(token, tokenType);
    }

    const cacheEntry: TokenCacheEntry = JSON.parse(cachedData);
    const tokenHash = generateTokenHash(token);

    // Verify token hasn't changed
    if (cacheEntry.tokenHash !== tokenHash) {
      logger.debug('Token hash mismatch, cache invalid', undefined, { module: 'TokenCache' });
      return await validateTokenWithDecode(token, tokenType);
    }

    // Check cache age
    const cacheAge = Date.now() - cacheEntry.cachedAt;
    if (cacheAge > CACHE_CONFIG.MAX_CACHE_AGE_MS) {
      logger.debug('Cache too old, refreshing', { cacheAgeHours: cacheAge / (60 * 60 * 1000) }, { module: 'TokenCache' });
      return await validateTokenWithDecode(token, tokenType);
    }

    // Fast validation using cached expiry
    const now = Date.now();
    const expiresAt = cacheEntry.expiresAt - CACHE_CONFIG.EXPIRY_BUFFER_MS;
    const isValid = now < expiresAt;
    const expiresInMinutes = Math.round((cacheEntry.expiresAt - now) / 60000);

    logger.debug(`Fast token validation from cache`, {
      isValid,
      expiresInMinutes,
      tokenType
    }, { module: 'TokenCache' });

    return {
      isValid,
      isCached: true,
      expiresInMinutes: isValid ? expiresInMinutes : undefined,
      expiresAt: cacheEntry.expiresAt,
      method: 'cache'
    };

  } catch (error) {
    logger.error('Cache validation failed, falling back to decode', error, { module: 'TokenCache' });
    return await validateTokenWithDecode(token, tokenType);
  }
};

/**
 * Fallback validation with token decoding (slow but accurate)
 */
const validateTokenWithDecode = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<TokenValidationResult> => {
  try {
    const parsedToken = parseTokenExpiry(token);
    
    if (!parsedToken) {
      return {
        isValid: false,
        isCached: false,
        method: 'error',
        error: 'Failed to parse token'
      };
    }

    // Cache the result for future use
    await cacheTokenExpiry(token, tokenType);

    const now = Date.now();
    const expiresAt = parsedToken.expiresAt - CACHE_CONFIG.EXPIRY_BUFFER_MS;
    const isValid = now < expiresAt;
    const expiresInMinutes = Math.round((parsedToken.expiresAt - now) / 60000);

    logger.debug(`Token validation via decode`, {
      isValid,
      expiresInMinutes,
      tokenType
    }, { module: 'TokenCache' });

    return {
      isValid,
      isCached: false,
      expiresInMinutes: isValid ? expiresInMinutes : undefined,
      expiresAt: parsedToken.expiresAt,
      method: 'decode'
    };

  } catch (error) {
    logger.error('Token decode validation failed', error, { module: 'TokenCache' });
    return {
      isValid: false,
      isCached: false,
      method: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if token is expired (fast offline check)
 */
export const isTokenExpiredCached = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<boolean> => {
  const validation = await validateTokenFromCache(token, tokenType);
  return !validation.isValid;
};

/**
 * Get token expiration time from cache (fast offline check)
 */
export const getTokenExpirationTimeCached = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<number | null> => {
  const validation = await validateTokenFromCache(token, tokenType);
  return validation.expiresAt || null;
};

/**
 * Get detailed token information from cache
 */
export const getTokenInfoFromCache = async (
  token: string, 
  tokenType: 'access' | 'refresh'
): Promise<TokenCacheEntry | null> => {
  try {
    const cacheKey = tokenType === 'access' 
      ? CACHE_KEYS.ACCESS_TOKEN_CACHE 
      : CACHE_KEYS.REFRESH_TOKEN_CACHE;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }

    const cacheEntry: TokenCacheEntry = JSON.parse(cachedData);
    const tokenHash = generateTokenHash(token);

    // Verify token matches
    if (cacheEntry.tokenHash !== tokenHash) {
      return null;
    }

    return cacheEntry;
  } catch (error) {
    logger.error('Failed to get token info from cache', error, { module: 'TokenCache' });
    return null;
  }
};

/**
 * Clear token cache
 */
export const clearTokenCache = async (tokenType?: 'access' | 'refresh'): Promise<void> => {
  try {
    if (tokenType) {
      const cacheKey = tokenType === 'access' 
        ? CACHE_KEYS.ACCESS_TOKEN_CACHE 
        : CACHE_KEYS.REFRESH_TOKEN_CACHE;
      await AsyncStorage.removeItem(cacheKey);
      logger.debug(`Cleared ${tokenType} token cache`, undefined, { module: 'TokenCache' });
    } else {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.ACCESS_TOKEN_CACHE,
        CACHE_KEYS.REFRESH_TOKEN_CACHE
      ]);
      logger.debug('Cleared all token caches', undefined, { module: 'TokenCache' });
    }
  } catch (error) {
    logger.error('Failed to clear token cache', error, { module: 'TokenCache' });
  }
};

/**
 * Cleanup expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  try {
    const now = Date.now();
    
    for (const cacheKey of [CACHE_KEYS.ACCESS_TOKEN_CACHE, CACHE_KEYS.REFRESH_TOKEN_CACHE]) {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const cacheEntry: TokenCacheEntry = JSON.parse(cachedData);
        
        // Remove if cache is too old or token is expired
        const cacheAge = now - cacheEntry.cachedAt;
        const isExpired = now > cacheEntry.expiresAt;
        const isTooOld = cacheAge > CACHE_CONFIG.MAX_CACHE_AGE_MS;
        
        if (isExpired || isTooOld) {
          await AsyncStorage.removeItem(cacheKey);
          logger.debug(`Cleaned up expired cache entry`, {
            cacheKey,
            isExpired,
            isTooOld,
            cacheAgeHours: cacheAge / (60 * 60 * 1000)
          }, { module: 'TokenCache' });
        }
      }
    }
  } catch (error) {
    logger.error('Failed to cleanup expired cache', error, { module: 'TokenCache' });
  }
};

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = async (): Promise<{
  accessTokenCached: boolean;
  refreshTokenCached: boolean;
  accessTokenValid?: boolean;
  refreshTokenValid?: boolean;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
}> => {
  try {
    const [accessCache, refreshCache] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEYS.ACCESS_TOKEN_CACHE),
      AsyncStorage.getItem(CACHE_KEYS.REFRESH_TOKEN_CACHE)
    ]);

    const stats = {
      accessTokenCached: !!accessCache,
      refreshTokenCached: !!refreshCache,
    } as any;

    if (accessCache) {
      const entry: TokenCacheEntry = JSON.parse(accessCache);
      const now = Date.now();
      stats.accessTokenValid = now < entry.expiresAt;
      stats.accessTokenExpiresIn = Math.round((entry.expiresAt - now) / 60000);
    }

    if (refreshCache) {
      const entry: TokenCacheEntry = JSON.parse(refreshCache);
      const now = Date.now();
      stats.refreshTokenValid = now < entry.expiresAt;
      stats.refreshTokenExpiresIn = Math.round((entry.expiresAt - now) / 60000);
    }

    return stats;
  } catch (error) {
    logger.error('Failed to get cache stats', error, { module: 'TokenCache' });
    return {
      accessTokenCached: false,
      refreshTokenCached: false,
    };
  }
};

/**
 * Initialize token cache system
 */
export const initializeTokenCache = async (): Promise<void> => {
  try {
    // Check cache version
    const currentVersion = await AsyncStorage.getItem(CACHE_KEYS.CACHE_VERSION);
    
    if (currentVersion !== CACHE_CONFIG.VERSION) {
      logger.info('Token cache version mismatch, clearing cache', {
        currentVersion,
        expectedVersion: CACHE_CONFIG.VERSION
      }, { module: 'TokenCache' });
      
      await clearTokenCache();
      await AsyncStorage.setItem(CACHE_KEYS.CACHE_VERSION, CACHE_CONFIG.VERSION);
    }

    // Initial cleanup
    await cleanupExpiredCache();

    logger.info('Token cache system initialized', undefined, { module: 'TokenCache' });
  } catch (error) {
    logger.error('Failed to initialize token cache', error, { module: 'TokenCache' });
  }
};

// ========================================
// EXPORTS
// ========================================

export type { TokenValidationResult, TokenCacheEntry };
export { CACHE_CONFIG }; 