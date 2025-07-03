/**
 * Secure Token Storage Service
 * 
 * Enhanced token storage service that integrates with existing auth storage
 * and provides additional security layers including:
 * - Integration with token encryption system
 * - Backward compatibility with existing storage
 * - Migration from basic to encrypted storage
 * - Secure token lifecycle management
 * - Device binding and validation
 * 
 * Features:
 * - Seamless integration with existing auth flow
 * - Automatic migration to encrypted storage
 * - Fallback to basic storage if encryption fails
 * - Device binding for token security
 * - Token integrity validation
 * - Secure token rotation
 * - Performance monitoring
 * 
 * @module @core/auth/secure-token-storage
 * @author Hoy Development Team
 * @version 1.0.0
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@core/utils/sys/log';
import {
  encryptAndStoreToken,
  retrieveAndDecryptToken,
  validateStoredTokenSecurity,
  rotateTokenSecurity as rotateTokenSecurityInternal,
  clearAllTokenSecurity,
  getTokenEncryptionStats,
  type TokenValidationResult,
  type TokenRotationResult,
  TokenEncryptionError,
} from '@core/security/token-encryption';

// Import existing storage functions for backward compatibility
import {
  saveTokenToStorage as basicSaveToken,
  saveRefreshTokenToStorage as basicSaveRefreshToken,
  getTokenFromStorage as basicGetToken,
  getRefreshTokenFromStorage as basicGetRefreshToken,
  clearTokensFromStorage as basicClearTokens,
} from './storage';

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface SecureTokenStorageConfig {
  encryptionEnabled: boolean;
  deviceBindingEnabled: boolean;
  migrationEnabled: boolean;
  fallbackToBasicStorage: boolean;
  tokenValidationEnabled: boolean;
  rotationEnabled: boolean;
  performanceMonitoring: boolean;
  debugMode: boolean;
}

export interface TokenStorageStats {
  encryptedTokensCount: number;
  basicTokensCount: number;
  migrationCount: number;
  validationFailures: number;
  rotationCount: number;
  lastRotation: number;
  deviceBindingActive: boolean;
  encryptionActive: boolean;
  averageRetrievalTime: number;
  averageStorageTime: number;
}

export interface TokenMigrationResult {
  success: boolean;
  migratedTokens: string[];
  errors: string[];
  timestamp: number;
}

export interface TokenStorageOperation {
  operation: 'store' | 'retrieve' | 'validate' | 'migrate' | 'rotate' | 'clear';
  tokenType: 'access' | 'refresh' | 'both';
  success: boolean;
  duration: number;
  timestamp: number;
  error?: string;
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: SecureTokenStorageConfig = {
  encryptionEnabled: true,
  deviceBindingEnabled: true,
  migrationEnabled: true,
  fallbackToBasicStorage: true,
  tokenValidationEnabled: true,
  rotationEnabled: true,
  performanceMonitoring: true,
  debugMode: __DEV__,
};

const STORAGE_KEYS = {
  MIGRATION_STATUS: 'token_migration_status',
  STORAGE_STATS: 'token_storage_stats',
  OPERATION_HISTORY: 'token_operation_history',
  SECURE_STORAGE_FLAG: 'secure_storage_enabled',
} as const;

// ========================================
// SECURE TOKEN STORAGE SERVICE CLASS
// ========================================

export class SecureTokenStorageService {
  private config: SecureTokenStorageConfig;
  private stats: TokenStorageStats;
  private operationHistory: TokenStorageOperation[] = [];
  private migrationCompleted: boolean = false;

  constructor(config: Partial<SecureTokenStorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      encryptedTokensCount: 0,
      basicTokensCount: 0,
      migrationCount: 0,
      validationFailures: 0,
      rotationCount: 0,
      lastRotation: 0,
      deviceBindingActive: this.config.deviceBindingEnabled,
      encryptionActive: this.config.encryptionEnabled,
      averageRetrievalTime: 0,
      averageStorageTime: 0,
    };

    // Initialize service
    this.initialize();
  }

  /**
   * Initialize the secure token storage service
   */
  private async initialize(): Promise<void> {
    try {
      logger.info('[SecureTokenStorage] Initializing secure token storage service', {
        encryptionEnabled: this.config.encryptionEnabled,
        deviceBindingEnabled: this.config.deviceBindingEnabled,
      }, {
        module: 'SecureTokenStorage'
      });

      // Load existing stats
      await this.loadStats();

      // Check migration status
      await this.checkMigrationStatus();

      // Perform migration if needed
      if (this.config.migrationEnabled && !this.migrationCompleted) {
        await this.migrateToSecureStorage();
      }

      logger.info('[SecureTokenStorage] Service initialized successfully', {
        migrationCompleted: this.migrationCompleted,
        encryptionActive: this.stats.encryptionActive,
      }, {
        module: 'SecureTokenStorage'
      });

    } catch (error) {
      logger.error('[SecureTokenStorage] Service initialization failed:', error, {
        module: 'SecureTokenStorage'
      });
      
      // Fallback to basic storage if initialization fails
      if (this.config.fallbackToBasicStorage) {
        this.config.encryptionEnabled = false;
        logger.warn('[SecureTokenStorage] Falling back to basic storage', undefined, {
          module: 'SecureTokenStorage'
        });
      }
    }
  }

  /**
   * Save access token with enhanced security
   */
  public async saveAccessToken(token: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (this.config.encryptionEnabled) {
        // Use encrypted storage
        await encryptAndStoreToken(token, 'access');
        this.stats.encryptedTokensCount++;
        
        logger.debug('[SecureTokenStorage] Access token saved with encryption', undefined, {
          module: 'SecureTokenStorage'
        });
      } else {
        // Fallback to basic storage
        await basicSaveToken(token);
        this.stats.basicTokensCount++;
        
        logger.debug('[SecureTokenStorage] Access token saved with basic storage', undefined, {
          module: 'SecureTokenStorage'
        });
      }

      // Record operation
      await this.recordOperation({
        operation: 'store',
        tokenType: 'access',
        success: true,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      // Update stats
      await this.updateStats();

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to save access token:', error, {
        module: 'SecureTokenStorage'
      });

      // Fallback to basic storage if encryption fails
      if (this.config.fallbackToBasicStorage && error instanceof TokenEncryptionError) {
        try {
          await basicSaveToken(token);
          this.stats.basicTokensCount++;
          logger.warn('[SecureTokenStorage] Fallback to basic storage for access token', undefined, {
            module: 'SecureTokenStorage'
          });
        } catch (fallbackError) {
          logger.error('[SecureTokenStorage] Fallback storage also failed:', fallbackError, {
            module: 'SecureTokenStorage'
          });
          throw fallbackError;
        }
      } else {
        throw error;
      }

      // Record failed operation
      await this.recordOperation({
        operation: 'store',
        tokenType: 'access',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Save refresh token with enhanced security
   */
  public async saveRefreshToken(token: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (this.config.encryptionEnabled) {
        // Use encrypted storage
        await encryptAndStoreToken(token, 'refresh');
        this.stats.encryptedTokensCount++;
        
        logger.debug('[SecureTokenStorage] Refresh token saved with encryption', undefined, {
          module: 'SecureTokenStorage'
        });
      } else {
        // Fallback to basic storage
        await basicSaveRefreshToken(token);
        this.stats.basicTokensCount++;
        
        logger.debug('[SecureTokenStorage] Refresh token saved with basic storage', undefined, {
          module: 'SecureTokenStorage'
        });
      }

      // Record operation
      await this.recordOperation({
        operation: 'store',
        tokenType: 'refresh',
        success: true,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      // Update stats
      await this.updateStats();

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to save refresh token:', error, {
        module: 'SecureTokenStorage'
      });

      // Fallback to basic storage if encryption fails
      if (this.config.fallbackToBasicStorage && error instanceof TokenEncryptionError) {
        try {
          await basicSaveRefreshToken(token);
          this.stats.basicTokensCount++;
          logger.warn('[SecureTokenStorage] Fallback to basic storage for refresh token', undefined, {
            module: 'SecureTokenStorage'
          });
        } catch (fallbackError) {
          logger.error('[SecureTokenStorage] Fallback storage also failed:', fallbackError, {
            module: 'SecureTokenStorage'
          });
          throw fallbackError;
        }
      } else {
        throw error;
      }

      // Record failed operation
      await this.recordOperation({
        operation: 'store',
        tokenType: 'refresh',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get access token with validation
   */
  public async getAccessToken(): Promise<string | null> {
    const startTime = Date.now();
    
    try {
      let token: string | null = null;

      if (this.config.encryptionEnabled) {
        // Try encrypted storage first
        token = await retrieveAndDecryptToken('access');
        
        // Validate token security if retrieved
        if (token && this.config.tokenValidationEnabled) {
          const validation = await validateStoredTokenSecurity('access');
          if (!validation.isValid) {
            this.stats.validationFailures++;
            logger.warn('[SecureTokenStorage] Access token validation failed:', validation.warnings, {
              module: 'SecureTokenStorage'
            });
            
            // Clear invalid token
            await this.clearAccessToken();
            token = null;
          }
        }
      }

      // Fallback to basic storage if no encrypted token found
      if (!token && this.config.fallbackToBasicStorage) {
        token = await basicGetToken();
        
        if (token) {
          logger.debug('[SecureTokenStorage] Retrieved access token from basic storage', undefined, {
            module: 'SecureTokenStorage'
          });
        }
      }

      // Record operation
      await this.recordOperation({
        operation: 'retrieve',
        tokenType: 'access',
        success: !!token,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return token;

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to get access token:', error, {
        module: 'SecureTokenStorage'
      });

      // Record failed operation
      await this.recordOperation({
        operation: 'retrieve',
        tokenType: 'access',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return null;
    }
  }

  /**
   * Get refresh token with validation
   */
  public async getRefreshToken(): Promise<string | null> {
    const startTime = Date.now();
    
    try {
      let token: string | null = null;

      if (this.config.encryptionEnabled) {
        // Try encrypted storage first
        token = await retrieveAndDecryptToken('refresh');
        
        // Validate token security if retrieved
        if (token && this.config.tokenValidationEnabled) {
          const validation = await validateStoredTokenSecurity('refresh');
          if (!validation.isValid) {
            this.stats.validationFailures++;
            logger.warn('[SecureTokenStorage] Refresh token validation failed:', validation.warnings, {
              module: 'SecureTokenStorage'
            });
            
            // Clear invalid token
            await this.clearRefreshToken();
            token = null;
          }
        }
      }

      // Fallback to basic storage if no encrypted token found
      if (!token && this.config.fallbackToBasicStorage) {
        token = await basicGetRefreshToken();
        
        if (token) {
          logger.debug('[SecureTokenStorage] Retrieved refresh token from basic storage', undefined, {
            module: 'SecureTokenStorage'
          });
        }
      }

      // Record operation
      await this.recordOperation({
        operation: 'retrieve',
        tokenType: 'refresh',
        success: !!token,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return token;

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to get refresh token:', error, {
        module: 'SecureTokenStorage'
      });

      // Record failed operation
      await this.recordOperation({
        operation: 'retrieve',
        tokenType: 'refresh',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return null;
    }
  }

  /**
   * Clear access token
   */
  public async clearAccessToken(): Promise<void> {
    try {
      // Clear from encrypted storage
      if (this.config.encryptionEnabled) {
        await SecureStore.deleteItemAsync('encrypted_access_token');
      }

      // Clear from basic storage
      await SecureStore.deleteItemAsync('accessToken');

      logger.debug('[SecureTokenStorage] Access token cleared', undefined, {
        module: 'SecureTokenStorage'
      });

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to clear access token:', error, {
        module: 'SecureTokenStorage'
      });
    }
  }

  /**
   * Clear refresh token
   */
  public async clearRefreshToken(): Promise<void> {
    try {
      // Clear from encrypted storage
      if (this.config.encryptionEnabled) {
        await SecureStore.deleteItemAsync('encrypted_refresh_token');
      }

      // Clear from basic storage
      await SecureStore.deleteItemAsync('refreshToken');

      logger.debug('[SecureTokenStorage] Refresh token cleared', undefined, {
        module: 'SecureTokenStorage'
      });

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to clear refresh token:', error, {
        module: 'SecureTokenStorage'
      });
    }
  }

  /**
   * Clear all tokens and security data
   */
  public async clearAllTokens(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Clear encrypted tokens
      if (this.config.encryptionEnabled) {
        await clearAllTokenSecurity();
      }

      // Clear basic tokens
      await basicClearTokens();

      // Clear additional token data
      await this.clearAccessToken();
      await this.clearRefreshToken();

      // Reset stats
      this.stats.encryptedTokensCount = 0;
      this.stats.basicTokensCount = 0;
      await this.updateStats();

      // Record operation
      await this.recordOperation({
        operation: 'clear',
        tokenType: 'both',
        success: true,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      logger.info('[SecureTokenStorage] All tokens cleared successfully', undefined, {
        module: 'SecureTokenStorage'
      });

    } catch (error) {
      logger.error('[SecureTokenStorage] Failed to clear all tokens:', error, {
        module: 'SecureTokenStorage'
      });

      // Record failed operation
      await this.recordOperation({
        operation: 'clear',
        tokenType: 'both',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Migrate from basic to encrypted storage
   */
  public async migrateToSecureStorage(): Promise<TokenMigrationResult> {
    const result: TokenMigrationResult = {
      success: true,
      migratedTokens: [],
      errors: [],
      timestamp: Date.now(),
    };

    try {
      logger.info('[SecureTokenStorage] Starting migration to secure storage', undefined, {
        module: 'SecureTokenStorage'
      });

      // Migrate access token
      const accessToken = await basicGetToken();
      if (accessToken) {
        try {
          await encryptAndStoreToken(accessToken, 'access');
          result.migratedTokens.push('access');
          this.stats.encryptedTokensCount++;
          
          logger.debug('[SecureTokenStorage] Access token migrated successfully', undefined, {
            module: 'SecureTokenStorage'
          });
        } catch (error) {
          const errorMsg = `Access token migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

      // Migrate refresh token
      const refreshToken = await basicGetRefreshToken();
      if (refreshToken) {
        try {
          await encryptAndStoreToken(refreshToken, 'refresh');
          result.migratedTokens.push('refresh');
          this.stats.encryptedTokensCount++;
          
          logger.debug('[SecureTokenStorage] Refresh token migrated successfully', undefined, {
            module: 'SecureTokenStorage'
          });
        } catch (error) {
          const errorMsg = `Refresh token migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

      // Update migration status
      if (result.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.MIGRATION_STATUS, 'completed');
        this.migrationCompleted = true;
        this.stats.migrationCount++;
      }

      // Update stats
      await this.updateStats();

      logger.info('[SecureTokenStorage] Migration completed', {
        success: result.success,
        migratedTokens: result.migratedTokens.length,
        errors: result.errors.length,
      }, {
        module: 'SecureTokenStorage'
      });

      return result;

    } catch (error) {
      logger.error('[SecureTokenStorage] Migration failed:', error, {
        module: 'SecureTokenStorage'
      });

      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown migration error');
      return result;
    }
  }

  /**
   * Rotate token security
   */
  public async rotateTokenSecurity(): Promise<TokenRotationResult> {
    if (!this.config.rotationEnabled || !this.config.encryptionEnabled) {
      return {
        success: false,
        newTokenId: '',
        rotationCount: 0,
        timestamp: Date.now(),
        error: 'Token rotation is disabled or encryption is not enabled',
      };
    }

    try {
      const result = await rotateTokenSecurityInternal();
      
      if (result.success) {
        this.stats.rotationCount++;
        this.stats.lastRotation = Date.now();
        await this.updateStats();
      }

      // Record operation
      await this.recordOperation({
        operation: 'rotate',
        tokenType: 'both',
        success: result.success,
        duration: 0, // Rotation is handled by token encryption manager
        timestamp: Date.now(),
        error: result.error,
      });

      return result;

    } catch (error) {
      logger.error('[SecureTokenStorage] Token rotation failed:', error, {
        module: 'SecureTokenStorage'
      });

      return {
        success: false,
        newTokenId: '',
        rotationCount: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown rotation error',
      };
    }
  }

  /**
   * Validate token security
   */
  public async validateTokenSecurity(): Promise<{
    accessToken: TokenValidationResult;
    refreshToken: TokenValidationResult;
  }> {
    const startTime = Date.now();
    
    try {
      const [accessValidation, refreshValidation] = await Promise.all([
        validateStoredTokenSecurity('access'),
        validateStoredTokenSecurity('refresh'),
      ]);

      // Record operation
      await this.recordOperation({
        operation: 'validate',
        tokenType: 'both',
        success: accessValidation.isValid && refreshValidation.isValid,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return {
        accessToken: accessValidation,
        refreshToken: refreshValidation,
      };

    } catch (error) {
      logger.error('[SecureTokenStorage] Token validation failed:', error, {
        module: 'SecureTokenStorage'
      });

      // Record failed operation
      await this.recordOperation({
        operation: 'validate',
        tokenType: 'both',
        success: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return failed validation results
      const failedValidation: TokenValidationResult = {
        isValid: false,
        deviceMatch: false,
        integrityValid: false,
        notTampered: false,
        withinRotationWindow: false,
        securityLevel: 'error',
        warnings: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };

      return {
        accessToken: failedValidation,
        refreshToken: failedValidation,
      };
    }
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats(): Promise<TokenStorageStats> {
    // Update encryption stats
    if (this.config.encryptionEnabled) {
      const encryptionStats = await getTokenEncryptionStats();
      this.stats.deviceBindingActive = encryptionStats.deviceBindingEnabled;
      this.stats.encryptionActive = encryptionStats.encryptionEnabled;
      this.stats.rotationCount = encryptionStats.rotationCount;
      this.stats.lastRotation = encryptionStats.lastRotation;
    }

    // Calculate average operation times
    const recentOperations = this.operationHistory.slice(-100); // Last 100 operations
    if (recentOperations.length > 0) {
      const storageOps = recentOperations.filter(op => op.operation === 'store');
      const retrievalOps = recentOperations.filter(op => op.operation === 'retrieve');

      this.stats.averageStorageTime = storageOps.length > 0 
        ? storageOps.reduce((sum, op) => sum + op.duration, 0) / storageOps.length 
        : 0;

      this.stats.averageRetrievalTime = retrievalOps.length > 0 
        ? retrievalOps.reduce((sum, op) => sum + op.duration, 0) / retrievalOps.length 
        : 0;
    }

    return { ...this.stats };
  }

  /**
   * Check migration status
   */
  private async checkMigrationStatus(): Promise<void> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATION_STATUS);
      this.migrationCompleted = status === 'completed';
    } catch (error) {
      logger.warn('[SecureTokenStorage] Failed to check migration status:', error, {
        module: 'SecureTokenStorage'
      });
      this.migrationCompleted = false;
    }
  }

  /**
   * Load existing statistics
   */
  private async loadStats(): Promise<void> {
    try {
      const statsData = await AsyncStorage.getItem(STORAGE_KEYS.STORAGE_STATS);
      if (statsData) {
        const savedStats = JSON.parse(statsData);
        this.stats = { ...this.stats, ...savedStats };
      }
    } catch (error) {
      logger.warn('[SecureTokenStorage] Failed to load stats:', error, {
        module: 'SecureTokenStorage'
      });
    }
  }

  /**
   * Update statistics
   */
  private async updateStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STORAGE_STATS, JSON.stringify(this.stats));
    } catch (error) {
      logger.warn('[SecureTokenStorage] Failed to update stats:', error, {
        module: 'SecureTokenStorage'
      });
    }
  }

  /**
   * Record operation for monitoring
   */
  private async recordOperation(operation: TokenStorageOperation): Promise<void> {
    if (!this.config.performanceMonitoring) {
      return;
    }

    try {
      this.operationHistory.push(operation);
      
      // Keep only last 500 operations
      if (this.operationHistory.length > 500) {
        this.operationHistory = this.operationHistory.slice(-500);
      }

      // Save to storage periodically (every 10 operations)
      if (this.operationHistory.length % 10 === 0) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.OPERATION_HISTORY, 
          JSON.stringify(this.operationHistory.slice(-100)) // Save only last 100
        );
      }
    } catch (error) {
      logger.warn('[SecureTokenStorage] Failed to record operation:', error, {
        module: 'SecureTokenStorage'
      });
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<SecureTokenStorageConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('[SecureTokenStorage] Configuration updated', config, {
      module: 'SecureTokenStorage'
    });
  }

  /**
   * Get recent operations for debugging
   */
  public getRecentOperations(): TokenStorageOperation[] {
    return this.operationHistory.slice(-50); // Last 50 operations
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const secureTokenStorage = new SecureTokenStorageService();

// ========================================
// CONVENIENCE FUNCTIONS FOR BACKWARD COMPATIBILITY
// ========================================

/**
 * Save access token to secure storage
 */
export const saveTokenToStorage = async (token: string): Promise<void> => {
  await secureTokenStorage.saveAccessToken(token);
};

/**
 * Save refresh token to secure storage
 */
export const saveRefreshTokenToStorage = async (token: string): Promise<void> => {
  await secureTokenStorage.saveRefreshToken(token);
};

/**
 * Get access token from secure storage
 */
export const getTokenFromStorage = async (): Promise<string | null> => {
  return await secureTokenStorage.getAccessToken();
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshTokenFromStorage = async (): Promise<string | null> => {
  return await secureTokenStorage.getRefreshToken();
};

/**
 * Clear all tokens from secure storage
 */
export const clearTokensFromStorage = async (): Promise<void> => {
  await secureTokenStorage.clearAllTokens();
};

// Re-export other functions for compatibility
export {
  hasValidAuthentication,
  markTokensAsInvalid,
  clearTokenInvalidation,
  setAuthStateChangeCallback,
} from './storage';

// ========================================
// ADDITIONAL SECURE FUNCTIONS
// ========================================

/**
 * Migrate tokens to secure storage
 */
export const migrateTokensToSecureStorage = async (): Promise<TokenMigrationResult> => {
  return await secureTokenStorage.migrateToSecureStorage();
};

/**
 * Rotate token security
 */
export const rotateTokenSecurity = async (): Promise<TokenRotationResult> => {
  return await secureTokenStorage.rotateTokenSecurity();
};

/**
 * Validate token security
 */
export const validateTokenSecurity = async () => {
  return await secureTokenStorage.validateTokenSecurity();
};

/**
 * Get token storage statistics
 */
export const getTokenStorageStats = async (): Promise<TokenStorageStats> => {
  return await secureTokenStorage.getStorageStats();
};

/**
 * Update secure storage configuration
 */
export const updateSecureStorageConfig = (config: Partial<SecureTokenStorageConfig>): void => {
  secureTokenStorage.updateConfig(config);
};

/**
 * Get recent storage operations
 */
export const getRecentStorageOperations = (): TokenStorageOperation[] => {
  return secureTokenStorage.getRecentOperations();
};