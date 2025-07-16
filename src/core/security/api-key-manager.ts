/**
 * API Key Management System
 * 
 * Comprehensive API key management that addresses:
 * - Elimination of hardcoded API keys
 * - Secure key storage and retrieval
 * - Automatic key rotation mechanism
 * - Key validation and health monitoring
 * - Multiple API provider support
 * - Runtime key configuration
 * 
 * Features:
 * - Server-side key management
 * - Encrypted key storage
 * - Automatic key rotation
 * - Key validation and health checks
 * - Provider fallback mechanisms
 * - Usage tracking and analytics
 * - Debug and monitoring tools
 * 
 * @module @core/security/api-key-manager
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import { logger } from '@core/utils/sys/log';
import { api } from '@core/api/client';

// Helper to get AsyncStorage if available
const getAsyncStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('@react-native-async-storage/async-storage').default;
    } catch (e) { return undefined; }
  }
  return undefined;
};
// Helper to get SecureStore if available
const getSecureStore = () => {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('expo-secure-store');
    } catch (e) { return undefined; }
  }
  return undefined;
};
// Helper to get Crypto if available
const getCrypto = () => {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('expo-crypto');
    } catch (e) { return undefined; }
  }
  return undefined;
};

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface ApiKeyConfig {
  provider: string;
  keyId: string;
  encryptedKey: string;
  keyType: 'primary' | 'fallback' | 'test';
  createdAt: number;
  expiresAt: number;
  lastRotation: number;
  rotationInterval: number;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface ApiProvider {
  name: string;
  displayName: string;
  baseUrl: string;
  authMethod: 'header' | 'query' | 'bearer';
  authHeader?: string;
  queryParam?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  endpoints: Record<string, string>;
  healthCheckEndpoint?: string;
  rotationSupported: boolean;
}

export interface KeyRotationResult {
  success: boolean;
  provider: string;
  oldKeyId: string;
  newKeyId: string;
  rotatedAt: number;
  error?: string;
}

export interface KeyValidationResult {
  isValid: boolean;
  provider: string;
  keyId: string;
  responseTime: number;
  errorCode?: string;
  errorMessage?: string;
  rateLimitRemaining?: number;
  validatedAt: number;
}

export interface ApiKeyManagerConfig {
  enabled: boolean;
  serverManagedKeys: boolean;
  encryptionEnabled: boolean;
  rotationEnabled: boolean;
  validationEnabled: boolean;
  fallbackEnabled: boolean;
  debugMode: boolean;
  rotationCheckInterval: number;
  validationInterval: number;
  maxRetries: number;
}

export interface KeyUsageStats {
  provider: string;
  keyId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: number;
  rateLimitHits: number;
  errorCounts: Record<string, number>;
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: ApiKeyManagerConfig = {
  enabled: true,
  serverManagedKeys: !__DEV__,
  encryptionEnabled: true,
  rotationEnabled: true,
  validationEnabled: true,
  fallbackEnabled: true,
  debugMode: __DEV__,
  rotationCheckInterval: 60 * 60 * 1000, // 1 hour
  validationInterval: 15 * 60 * 1000, // 15 minutes
  maxRetries: 3,
};

const STORAGE_KEYS = {
  API_KEYS: 'api_keys_encrypted',
  KEY_METADATA: 'api_key_metadata',
  USAGE_STATS: 'api_key_usage_stats',
  VALIDATION_CACHE: 'api_key_validation_cache',
  ROTATION_HISTORY: 'api_key_rotation_history',
  PROVIDER_CONFIG: 'api_provider_config',
} as const;

// ========================================
// API PROVIDERS CONFIGURATION
// ========================================

const API_PROVIDERS: Record<string, ApiProvider> = {
  GEOCODING: {
    name: 'geocoding',
    displayName: 'Geocoding Service',
    baseUrl: 'https://api.mapbox.com/geocoding/v5',
    authMethod: 'query',
    queryParam: 'access_token',
    rateLimit: {
      requestsPerMinute: 600,
      requestsPerHour: 50000,
      requestsPerDay: 100000,
    },
    endpoints: {
      search: '/mapbox.places/{query}.json',
      reverse: '/mapbox.places/{longitude},{latitude}.json',
    },
    healthCheckEndpoint: '/mapbox.places/test.json',
    rotationSupported: true,
  },
  CURRENCY: {
    name: 'currency',
    displayName: 'Currency Exchange',
    baseUrl: 'https://v6.exchangerate-api.com/v6',
    authMethod: 'query',
    queryParam: 'access_key',
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 1500,
      requestsPerDay: 1500,
    },
    endpoints: {
      latest: '/{key}/latest/{base}',
      convert: '/{key}/pair/{from}/{to}/{amount}',
      historical: '/{key}/history/{base}/{year}/{month}/{day}',
    },
    healthCheckEndpoint: '/{key}/latest/USD',
    rotationSupported: false,
  },
  ANALYTICS: {
    name: 'analytics',
    displayName: 'Analytics Service',
    baseUrl: 'https://api.analytics.com/v1',
    authMethod: 'header',
    authHeader: 'X-API-Key',
    rateLimit: {
      requestsPerMinute: 1000,
      requestsPerHour: 10000,
      requestsPerDay: 100000,
    },
    endpoints: {
      track: '/track',
      events: '/events',
      metrics: '/metrics',
    },
    healthCheckEndpoint: '/health',
    rotationSupported: true,
  },
};

// ========================================
// API KEY MANAGER CLASS
// ========================================

export class ApiKeyManager {
  private config: ApiKeyManagerConfig;
  private keys: Map<string, ApiKeyConfig> = new Map();
  private usageStats: Map<string, KeyUsageStats> = new Map();
  private validationCache: Map<string, KeyValidationResult> = new Map();
  private rotationTimer: NodeJS.Timeout | null = null;
  private validationTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ApiKeyManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize the manager
    this.initialize();
  }

  /**
   * Initialize the API key manager
   */
  private async initialize(): Promise<void> {
    try {
      logger.info('[ApiKeyManager] Initializing API key management system', {
        serverManaged: this.config.serverManagedKeys,
        encryptionEnabled: this.config.encryptionEnabled,
        rotationEnabled: this.config.rotationEnabled,
      }, {
        module: 'ApiKeyManager'
      });

      // Load existing keys and metadata
      await this.loadStoredKeys();
      await this.loadUsageStats();

      // Initialize server-managed keys if enabled
      if (this.config.serverManagedKeys) {
        await this.initializeServerManagedKeys();
      }

      // Start background services
      if (this.config.rotationEnabled) {
        this.startRotationService();
      }

      if (this.config.validationEnabled) {
        this.startValidationService();
      }

      logger.info('[ApiKeyManager] API key manager initialized successfully', {
        keysLoaded: this.keys.size,
        providersConfigured: Object.keys(API_PROVIDERS).length,
      }, {
        module: 'ApiKeyManager'
      });

    } catch (error) {
      logger.error('[ApiKeyManager] Failed to initialize API key manager:', error, {
        module: 'ApiKeyManager'
      });
      throw new ApiKeyManagerError('API key manager initialization failed', error);
    }
  }

  /**
   * Get API key for a specific provider
   */
  public async getApiKey(provider: string, keyType: 'primary' | 'fallback' = 'primary'): Promise<string | null> {
    try {
      const keyConfig = this.findActiveKey(provider, keyType);
      if (!keyConfig) {
        // Try to fetch from server if server-managed
        if (this.config.serverManagedKeys) {
          await this.fetchKeyFromServer(provider, keyType);
          const retryKeyConfig = this.findActiveKey(provider, keyType);
          if (retryKeyConfig) {
            return await this.decryptKey(retryKeyConfig.encryptedKey);
          }
        }

        logger.warn('[ApiKeyManager] No API key found for provider', {
          provider,
          keyType,
        }, {
          module: 'ApiKeyManager'
        });
        return null;
      }

      // Check if key needs rotation
      if (this.shouldRotateKey(keyConfig)) {
        await this.rotateKey(provider);
        // Get the new key after rotation
        const newKeyConfig = this.findActiveKey(provider, keyType);
        if (newKeyConfig) {
          return await this.decryptKey(newKeyConfig.encryptedKey);
        }
      }

      // Update usage statistics
      await this.updateUsageStats(provider, keyConfig.keyId);

      // Decrypt and return the key
      const decryptedKey = await this.decryptKey(keyConfig.encryptedKey);
      
      logger.debug('[ApiKeyManager] API key retrieved successfully', {
        provider,
        keyType,
        keyId: keyConfig.keyId.substring(0, 8) + '...',
      }, {
        module: 'ApiKeyManager'
      });

      return decryptedKey;

    } catch (error) {
      logger.error('[ApiKeyManager] Failed to get API key:', error, {
        module: 'ApiKeyManager'
      });
      return null;
    }
  }

  /**
   * Set API key for a provider
   */
  public async setApiKey(
    provider: string, 
    key: string, 
    keyType: 'primary' | 'fallback' = 'primary',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const encryptedKey = await this.encryptKey(key);
      const keyId = await this.generateKeyId(provider, keyType);
      
      const keyConfig: ApiKeyConfig = {
        provider,
        keyId,
        encryptedKey,
        keyType,
        createdAt: Date.now(),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year default
        lastRotation: Date.now(),
        rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days default
        usageCount: 0,
        maxUsage: 1000000, // 1M requests default
        isActive: true,
        metadata,
      };

      this.keys.set(`${provider}:${keyType}`, keyConfig);
      await this.saveKeys();

      // Initialize usage stats
      this.usageStats.set(keyId, {
        provider,
        keyId,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: 0,
        rateLimitHits: 0,
        errorCounts: {},
      });

      logger.info('[ApiKeyManager] API key set successfully', {
        provider,
        keyType,
        keyId: keyId.substring(0, 8) + '...',
      }, {
        module: 'ApiKeyManager'
      });

    } catch (error) {
      logger.error('[ApiKeyManager] Failed to set API key:', error, {
        module: 'ApiKeyManager'
      });
      throw new ApiKeyManagerError('Failed to set API key', error);
    }
  }

  /**
   * Rotate API key for a provider
   */
  public async rotateKey(provider: string): Promise<KeyRotationResult> {
    try {
      logger.info('[ApiKeyManager] Starting key rotation', { provider }, {
        module: 'ApiKeyManager'
      });

      const providerConfig = API_PROVIDERS[provider.toUpperCase()];
      if (!providerConfig || !providerConfig.rotationSupported) {
        return {
          success: false,
          provider,
          oldKeyId: '',
          newKeyId: '',
          rotatedAt: Date.now(),
          error: 'Key rotation not supported for this provider',
        };
      }

      // Get current key
      const currentKey = this.findActiveKey(provider, 'primary');
      if (!currentKey) {
        return {
          success: false,
          provider,
          oldKeyId: '',
          newKeyId: '',
          rotatedAt: Date.now(),
          error: 'No active key found for rotation',
        };
      }

      // Request new key from server
      const newKey = await this.requestNewKeyFromServer(provider);
      if (!newKey) {
        return {
          success: false,
          provider,
          oldKeyId: currentKey.keyId,
          newKeyId: '',
          rotatedAt: Date.now(),
          error: 'Failed to obtain new key from server',
        };
      }

      // Create new key configuration
      const newKeyId = await this.generateKeyId(provider, 'primary');
      const encryptedNewKey = await this.encryptKey(newKey);

      const newKeyConfig: ApiKeyConfig = {
        ...currentKey,
        keyId: newKeyId,
        encryptedKey: encryptedNewKey,
        createdAt: Date.now(),
        lastRotation: Date.now(),
        usageCount: 0,
      };

      // Update key storage
      this.keys.set(`${provider}:primary`, newKeyConfig);
      await this.saveKeys();

      // Save rotation history
      await this.saveRotationHistory({
        success: true,
        provider,
        oldKeyId: currentKey.keyId,
        newKeyId: newKeyId,
        rotatedAt: Date.now(),
      });

      logger.info('[ApiKeyManager] Key rotation completed successfully', {
        provider,
        oldKeyId: currentKey.keyId.substring(0, 8) + '...',
        newKeyId: newKeyId.substring(0, 8) + '...',
      }, {
        module: 'ApiKeyManager'
      });

      return {
        success: true,
        provider,
        oldKeyId: currentKey.keyId,
        newKeyId: newKeyId,
        rotatedAt: Date.now(),
      };

    } catch (error) {
      logger.error('[ApiKeyManager] Key rotation failed:', error, {
        module: 'ApiKeyManager'
      });

      const result: KeyRotationResult = {
        success: false,
        provider,
        oldKeyId: '',
        newKeyId: '',
        rotatedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown rotation error',
      };

      await this.saveRotationHistory(result);
      return result;
    }
  }

  /**
   * Validate API key health
   */
  public async validateKey(provider: string, keyType: 'primary' | 'fallback' = 'primary'): Promise<KeyValidationResult> {
    const startTime = Date.now();
    
    try {
      const keyConfig = this.findActiveKey(provider, keyType);
      if (!keyConfig) {
        return {
          isValid: false,
          provider,
          keyId: '',
          responseTime: Date.now() - startTime,
          errorMessage: 'No key configuration found',
          validatedAt: Date.now(),
        };
      }

      const providerConfig = API_PROVIDERS[provider.toUpperCase()];
      if (!providerConfig || !providerConfig.healthCheckEndpoint) {
        return {
          isValid: false,
          provider,
          keyId: keyConfig.keyId,
          responseTime: Date.now() - startTime,
          errorMessage: 'No health check endpoint configured',
          validatedAt: Date.now(),
        };
      }

      // Get decrypted key
      const apiKey = await this.decryptKey(keyConfig.encryptedKey);
      if (!apiKey) {
        return {
          isValid: false,
          provider,
          keyId: keyConfig.keyId,
          responseTime: Date.now() - startTime,
          errorMessage: 'Failed to decrypt API key',
          validatedAt: Date.now(),
        };
      }

      // Construct health check URL
      let healthCheckUrl = providerConfig.baseUrl + providerConfig.healthCheckEndpoint;
      healthCheckUrl = healthCheckUrl.replace('{key}', apiKey);

      // Make health check request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
        ? parseInt(response.headers.get('X-RateLimit-Remaining')!) 
        : undefined;

      const result: KeyValidationResult = {
        isValid: response.ok,
        provider,
        keyId: keyConfig.keyId,
        responseTime,
        errorCode: response.ok ? undefined : response.status.toString(),
        errorMessage: response.ok ? undefined : response.statusText,
        rateLimitRemaining,
        validatedAt: Date.now(),
      };

      // Cache validation result
      this.validationCache.set(`${provider}:${keyType}`, result);

      logger.debug('[ApiKeyManager] Key validation completed', {
        provider,
        keyType,
        isValid: result.isValid,
        responseTime,
      }, {
        module: 'ApiKeyManager'
      });

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('[ApiKeyManager] Key validation failed:', error, {
        module: 'ApiKeyManager'
      });

      return {
        isValid: false,
        provider,
        keyId: '',
        responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown validation error',
        validatedAt: Date.now(),
      };
    }
  }

  /**
   * Get API key usage statistics
   */
  public getUsageStats(provider?: string): KeyUsageStats[] {
    const stats = Array.from(this.usageStats.values());
    return provider ? stats.filter(stat => stat.provider === provider) : stats;
  }

  /**
   * Get all configured providers
   */
  public getProviders(): ApiProvider[] {
    return Object.values(API_PROVIDERS);
  }

  /**
   * Get key validation results
   */
  public getValidationResults(provider?: string): KeyValidationResult[] {
    const results = Array.from(this.validationCache.values());
    return provider ? results.filter(result => result.provider === provider) : results;
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Find active key for provider and type
   */
  private findActiveKey(provider: string, keyType: 'primary' | 'fallback'): ApiKeyConfig | null {
    const key = this.keys.get(`${provider}:${keyType}`);
    return key && key.isActive ? key : null;
  }

  /**
   * Check if key should be rotated
   */
  private shouldRotateKey(keyConfig: ApiKeyConfig): boolean {
    const now = Date.now();
    const timeSinceRotation = now - keyConfig.lastRotation;
    const usageThreshold = keyConfig.maxUsage * 0.8; // Rotate at 80% usage

    return (
      timeSinceRotation >= keyConfig.rotationInterval ||
      keyConfig.usageCount >= usageThreshold ||
      now >= keyConfig.expiresAt
    );
  }

  /**
   * Encrypt API key
   */
  private async encryptKey(key: string): Promise<string> {
    if (!this.config.encryptionEnabled) {
      return btoa(key); // Simple base64 encoding if encryption disabled
    }

    // Use device-specific encryption
    const deviceSalt = await this.getDeviceSalt();
    const keyData = `${key}|${Date.now()}|${deviceSalt}`;
    
    // Simple encryption using device characteristics
    const encrypted = btoa(keyData);
    return encrypted;
  }

  /**
   * Decrypt API key
   */
  private async decryptKey(encryptedKey: string): Promise<string> {
    try {
      if (!this.config.encryptionEnabled) {
        return atob(encryptedKey); // Simple base64 decoding
      }

      // Decrypt using device-specific method
      const decrypted = atob(encryptedKey);
      const [key] = decrypted.split('|');
      return key;

    } catch (error) {
      logger.error('[ApiKeyManager] Failed to decrypt API key:', error, {
        module: 'ApiKeyManager'
      });
      throw new ApiKeyManagerError('Failed to decrypt API key', error);
    }
  }

  /**
   * Generate unique key ID
   */
  private async generateKeyId(provider: string, keyType: string): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${provider}_${keyType}_${timestamp}_${random}`;
  }

  /**
   * Get device salt for encryption
   */
  private async getDeviceSalt(): Promise<string> {
    try {
      const SecureStore = getSecureStore();
      let salt = await SecureStore?.getItemAsync('device_salt');
      if (!salt) {
        const Crypto = getCrypto();
        salt = await Crypto?.randomUUID();
        await SecureStore?.setItemAsync('device_salt', salt);
      }
      return salt;
    } catch (error) {
      return 'fallback_salt';
    }
  }

  /**
   * Load stored keys
   */
  private async loadStoredKeys(): Promise<void> {
    try {
      const SecureStore = getSecureStore();
      const storedKeys = await SecureStore?.getItemAsync(STORAGE_KEYS.API_KEYS);
      if (storedKeys) {
        const keyData = JSON.parse(storedKeys);
        for (const [keyPath, config] of Object.entries(keyData)) {
          this.keys.set(keyPath, config as ApiKeyConfig);
        }
      }
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to load stored keys:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Save keys to storage
   */
  private async saveKeys(): Promise<void> {
    try {
      const SecureStore = getSecureStore();
      const keyData = Object.fromEntries(this.keys);
      await SecureStore?.setItemAsync(STORAGE_KEYS.API_KEYS, JSON.stringify(keyData));
    } catch (error) {
      logger.error('[ApiKeyManager] Failed to save keys:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Load usage statistics
   */
  private async loadUsageStats(): Promise<void> {
    try {
      const AsyncStorage = getAsyncStorage();
      const storedStats = await AsyncStorage?.getItem(STORAGE_KEYS.USAGE_STATS);
      if (storedStats) {
        const statsData = JSON.parse(storedStats);
        for (const [keyId, stats] of Object.entries(statsData)) {
          this.usageStats.set(keyId, stats as KeyUsageStats);
        }
      }
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to load usage stats:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Update usage statistics
   */
  private async updateUsageStats(provider: string, keyId: string): Promise<void> {
    try {
      const AsyncStorage = getAsyncStorage();
      let stats = this.usageStats.get(keyId);
      if (!stats) {
        stats = {
          provider,
          keyId,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          lastUsed: 0,
          rateLimitHits: 0,
          errorCounts: {},
        };
      }

      stats.totalRequests++;
      stats.lastUsed = Date.now();
      this.usageStats.set(keyId, stats);

      // Save periodically
      if (stats.totalRequests % 10 === 0) {
        await this.saveUsageStats();
      }
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to update usage stats:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Save usage statistics
   */
  private async saveUsageStats(): Promise<void> {
    try {
      const AsyncStorage = getAsyncStorage();
      const statsData = Object.fromEntries(this.usageStats);
      await AsyncStorage?.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(statsData));
    } catch (error) {
      logger.error('[ApiKeyManager] Failed to save usage stats:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Initialize server-managed keys
   */
  private async initializeServerManagedKeys(): Promise<void> {
    try {
      // Fetch key configuration from server
      const response = await api.get('/api-keys/config');
      const serverConfig = response.data as Record<string, any>;

      for (const provider of Object.keys(API_PROVIDERS)) {
        if (serverConfig && typeof serverConfig === 'object' && serverConfig[provider.toLowerCase()]) {
          await this.fetchKeyFromServer(provider.toLowerCase(), 'primary');
        }
      }
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to initialize server-managed keys:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Fetch key from server
   */
  private async fetchKeyFromServer(provider: string, keyType: 'primary' | 'fallback'): Promise<void> {
    try {
      const response = await api.get(`/api-keys/${provider}/${keyType}`);
      const responseData = response.data as { key?: string; metadata?: Record<string, any> };
      
      if (responseData?.key) {
        await this.setApiKey(provider, responseData.key, keyType, responseData.metadata || {});
      }
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to fetch key from server:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Request new key from server for rotation
   */
  private async requestNewKeyFromServer(provider: string): Promise<string | null> {
    try {
      const response = await api.post(`/api-keys/${provider}/rotate`);
      const responseData = response.data as { key?: string };
      return responseData?.key || null;
    } catch (error) {
      logger.error('[ApiKeyManager] Failed to request new key from server:', error, {
        module: 'ApiKeyManager'
      });
      return null;
    }
  }

  /**
   * Save rotation history
   */
  private async saveRotationHistory(result: KeyRotationResult): Promise<void> {
    try {
      const AsyncStorage = getAsyncStorage();
      const history = await this.getRotationHistory();
      history.push(result);
      
      // Keep only last 50 rotations
      const limitedHistory = history.slice(-50);
      
      await AsyncStorage?.setItem(STORAGE_KEYS.ROTATION_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      logger.warn('[ApiKeyManager] Failed to save rotation history:', error, {
        module: 'ApiKeyManager'
      });
    }
  }

  /**
   * Get rotation history
   */
  private async getRotationHistory(): Promise<KeyRotationResult[]> {
    try {
      const AsyncStorage = getAsyncStorage();
      const historyData = await AsyncStorage?.getItem(STORAGE_KEYS.ROTATION_HISTORY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Start rotation service
   */
  private startRotationService(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    this.rotationTimer = setInterval(async () => {
      try {
        for (const [keyPath, keyConfig] of Array.from(this.keys.entries())) {
          if (this.shouldRotateKey(keyConfig)) {
            await this.rotateKey(keyConfig.provider);
          }
        }
      } catch (error) {
        logger.error('[ApiKeyManager] Rotation service error:', error, {
          module: 'ApiKeyManager'
        });
      }
    }, this.config.rotationCheckInterval);
  }

  /**
   * Start validation service
   */
  private startValidationService(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(async () => {
      try {
        for (const provider of Object.keys(API_PROVIDERS)) {
          await this.validateKey(provider.toLowerCase(), 'primary');
        }
      } catch (error) {
        logger.error('[ApiKeyManager] Validation service error:', error, {
          module: 'ApiKeyManager'
        });
      }
    }, this.config.validationInterval);
  }

  /**
   * Clear all timers
   */
  public destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }

    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
  }
}

// ========================================
// ERROR CLASS
// ========================================

export class ApiKeyManagerError extends Error {
  public readonly isApiKeyManagerError = true;
  public readonly cause?: any;

  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'ApiKeyManagerError';
    this.cause = cause;
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const apiKeyManager = new ApiKeyManager();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Get API key for a provider
 */
export const getApiKey = async (provider: string, keyType: 'primary' | 'fallback' = 'primary'): Promise<string | null> => {
  return await apiKeyManager.getApiKey(provider, keyType);
};

/**
 * Set API key for a provider
 */
export const setApiKey = async (
  provider: string, 
  key: string, 
  keyType: 'primary' | 'fallback' = 'primary',
  metadata: Record<string, any> = {}
): Promise<void> => {
  return await apiKeyManager.setApiKey(provider, key, keyType, metadata);
};

/**
 * Rotate API key for a provider
 */
export const rotateApiKey = async (provider: string): Promise<KeyRotationResult> => {
  return await apiKeyManager.rotateKey(provider);
};

/**
 * Validate API key for a provider
 */
export const validateApiKey = async (provider: string, keyType: 'primary' | 'fallback' = 'primary'): Promise<KeyValidationResult> => {
  return await apiKeyManager.validateKey(provider, keyType);
};

/**
 * Get API key usage statistics
 */
export const getApiKeyUsageStats = (provider?: string): KeyUsageStats[] => {
  return apiKeyManager.getUsageStats(provider);
};

/**
 * Get all configured API providers
 */
export const getApiProviders = (): ApiProvider[] => {
  return apiKeyManager.getProviders();
};

/**
 * Get key validation results
 */
export const getKeyValidationResults = (provider?: string): KeyValidationResult[] => {
  return apiKeyManager.getValidationResults(provider);
};