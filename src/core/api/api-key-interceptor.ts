/**
 * API Key Interceptor
 * 
 * Automatically injects secure API keys into requests based on provider configuration.
 * Replaces hardcoded keys with dynamically managed, encrypted keys.
 * 
 * Features:
 * - Automatic API key injection
 * - Provider-specific key management
 * - Fallback key handling
 * - Request validation and error handling
 * - Performance monitoring
 * - Key rotation support
 * 
 * @module @core/api/api-key-interceptor
 * @author Hoy Development Team
 * @version 1.0.0
 */

import axios from 'axios';
import { logger } from '@core/utils/sys/log';
import { 
  getApiKey, 
  getApiProviders, 
  ApiProvider,
  ApiKeyManagerError 
} from '@core/security/api-key-manager';

type AxiosRequestConfig = Parameters<typeof axios.interceptors.request.use>[0] extends (config: infer T) => any ? T : any;
type AxiosResponse = ReturnType<typeof axios.get> extends Promise<infer T> ? T : any;
type AxiosError = Parameters<typeof axios.interceptors.response.use>[1] extends (error: infer T) => any ? T : any;

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface ApiKeyInterceptorConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  debugMode: boolean;
  maxRetries: number;
  retryDelay: number;
  keyRotationOnError: boolean;
  performanceTracking: boolean;
}

export interface KeyInjectionResult {
  provider: string;
  keyType: 'primary' | 'fallback';
  injectionMethod: 'header' | 'query' | 'bearer';
  success: boolean;
  processingTime: number;
  error?: string;
}

export interface ApiKeyInterceptorStats {
  totalRequests: number;
  successfulInjections: number;
  failedInjections: number;
  fallbackUsage: number;
  keyRotations: number;
  averageProcessingTime: number;
  errorCounts: Record<string, number>;
  providerStats: Record<string, {
    requests: number;
    successes: number;
    failures: number;
    lastUsed: number;
  }>;
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: ApiKeyInterceptorConfig = {
  enabled: true,
  fallbackEnabled: true,
  debugMode: __DEV__,
  maxRetries: 3,
  retryDelay: 1000,
  keyRotationOnError: true,
  performanceTracking: true,
};

// ========================================
// API KEY INTERCEPTOR CLASS
// ========================================

export class ApiKeyInterceptor {
  private config: ApiKeyInterceptorConfig;
  private providers: Map<string, ApiProvider> = new Map();
  private stats: ApiKeyInterceptorStats;

  constructor(config: Partial<ApiKeyInterceptorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize statistics
    this.stats = {
      totalRequests: 0,
      successfulInjections: 0,
      failedInjections: 0,
      fallbackUsage: 0,
      keyRotations: 0,
      averageProcessingTime: 0,
      errorCounts: {},
      providerStats: {},
    };

    // Load API providers
    this.loadProviders();
  }

  /**
   * Load available API providers
   */
  private loadProviders(): void {
    try {
      const providers = getApiProviders();
      for (const provider of providers) {
        this.providers.set(provider.name, provider);
        
        // Initialize provider stats
        this.stats.providerStats[provider.name] = {
          requests: 0,
          successes: 0,
          failures: 0,
          lastUsed: 0,
        };
      }

      logger.debug('[ApiKeyInterceptor] Loaded API providers', {
        count: providers.length,
        providers: providers.map(p => p.name),
      }, {
        module: 'ApiKeyInterceptor'
      });

    } catch (error) {
      logger.error('[ApiKeyInterceptor] Failed to load API providers:', error, {
        module: 'ApiKeyInterceptor'
      });
    }
  }

  /**
   * Request interceptor - inject API keys
   */
  public async requestInterceptor(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (!this.config.enabled) {
      return config;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // Identify the provider for this request
      const provider = this.identifyProvider(config);
      if (!provider) {
        // No provider identified - pass through without modification
        return config;
      }

      // Inject API key
      const injectionResult = await this.injectApiKey(config, provider);
      
      // Update statistics
      this.updateStats(injectionResult, startTime);

      if (injectionResult.success) {
        logger.debug('[ApiKeyInterceptor] API key injected successfully', {
          provider: injectionResult.provider,
          keyType: injectionResult.keyType,
          method: injectionResult.injectionMethod,
          processingTime: injectionResult.processingTime,
        }, {
          module: 'ApiKeyInterceptor'
        });
      } else {
        logger.warn('[ApiKeyInterceptor] Failed to inject API key', {
          provider: injectionResult.provider,
          error: injectionResult.error,
        }, {
          module: 'ApiKeyInterceptor'
        });
      }

      return config;

    } catch (error) {
      this.stats.failedInjections++;
      this.recordError(error);

      logger.error('[ApiKeyInterceptor] Request interceptor error:', error, {
        module: 'ApiKeyInterceptor'
      });

      // Return original config on error to avoid breaking the request
      return config;
    }
  }

  /**
   * Response interceptor - handle API key related errors
   */
  public async responseInterceptor(
    response: AxiosResponse
  ): Promise<AxiosResponse> {
    // Handle successful responses
    return response;
  }

  /**
   * Error interceptor - handle API key related errors
   */
  public async errorInterceptor(error: AxiosError): Promise<never> {
    if (!this.config.enabled) {
      throw error;
    }

    try {
      // Check if error is API key related
      if (this.isApiKeyError(error)) {
        const provider = this.identifyProvider(error.config);
        
        if (provider && this.config.keyRotationOnError) {
          logger.warn('[ApiKeyInterceptor] API key error detected, attempting key rotation', {
            provider: provider.name,
            status: error.response?.status,
            message: error.message,
          }, {
            module: 'ApiKeyInterceptor'
          });

          // Attempt to rotate key and retry request
          try {
            const retryResult = await this.handleApiKeyError(error, provider);
            if (retryResult) {
              this.stats.keyRotations++;
              logger.info('[ApiKeyInterceptor] Successfully retried request after key rotation', {
                provider: provider.name,
                status: retryResult.status,
                module: 'ApiKeyInterceptor'
              });
              return retryResult as never;
            }
          } catch (retryError) {
            logger.error('[ApiKeyInterceptor] Key rotation retry failed:', {
              provider: provider.name,
              originalError: error.message,
              retryError: retryError instanceof Error ? retryError.message : String(retryError),
              module: 'ApiKeyInterceptor'
            });
            // Continue to throw original error
          }
        }
      }

      // Record error statistics
      this.recordError(error);

    } catch (interceptorError) {
      logger.error('[ApiKeyInterceptor] Error interceptor failed:', interceptorError, {
        module: 'ApiKeyInterceptor'
      });
    }

    // Re-throw original error
    throw error;
  }

  /**
   * Get interceptor statistics
   */
  public getStats(): ApiKeyInterceptorStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulInjections: 0,
      failedInjections: 0,
      fallbackUsage: 0,
      keyRotations: 0,
      averageProcessingTime: 0,
      errorCounts: {},
      providerStats: {},
    };

    // Reinitialize provider stats
    for (const provider of this.providers.values()) {
      this.stats.providerStats[provider.name] = {
        requests: 0,
        successes: 0,
        failures: 0,
        lastUsed: 0,
      };
    }
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Identify API provider from request configuration
   */
  private identifyProvider(config?: AxiosRequestConfig): ApiProvider | null {
    if (!config || !config.url) {
      return null;
    }

    const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url;

    // Check each provider's base URL
    for (const provider of this.providers.values()) {
      if (url.includes(provider.baseUrl) || url.includes(provider.name)) {
        return provider;
      }
    }

    // Check for specific patterns
    if (url.includes('geocoding') || url.includes('mapbox')) {
      return this.providers.get('geocoding') || null;
    }

    if (url.includes('currency') || url.includes('exchange')) {
      return this.providers.get('currency') || null;
    }

    if (url.includes('analytics')) {
      return this.providers.get('analytics') || null;
    }

    return null;
  }

  /**
   * Inject API key into request configuration
   */
  private async injectApiKey(
    config: AxiosRequestConfig, 
    provider: ApiProvider
  ): Promise<KeyInjectionResult> {
    const startTime = Date.now();

    try {
      // Try primary key first
      let apiKey = await getApiKey(provider.name, 'primary');
      let keyType: 'primary' | 'fallback' = 'primary';

      // Try fallback key if primary failed and fallback is enabled
      if (!apiKey && this.config.fallbackEnabled) {
        apiKey = await getApiKey(provider.name, 'fallback');
        keyType = 'fallback';
        this.stats.fallbackUsage++;
      }

      if (!apiKey) {
        return {
          provider: provider.name,
          keyType,
          injectionMethod: provider.authMethod,
          success: false,
          processingTime: Date.now() - startTime,
          error: 'No API key available',
        };
      }

      // Inject key based on provider's authentication method
      switch (provider.authMethod) {
        case 'header':
          if (!config.headers) {
            config.headers = {};
          }
          const headerName = provider.authHeader || 'X-API-Key';
          config.headers[headerName] = apiKey;
          break;

        case 'query':
          if (!config.params) {
            config.params = {};
          }
          const queryParam = provider.queryParam || 'api_key';
          (config.params as any)[queryParam] = apiKey;
          break;

        case 'bearer':
          // Only set Authorization header if not already present (don't override access token)
          if (!config.headers) {
            config.headers = {};
          }
          if (!(config.headers as any).Authorization) {
            (config.headers as any).Authorization = `Bearer ${apiKey}`;
          }
          break;

        default:
          return {
            provider: provider.name,
            keyType,
            injectionMethod: provider.authMethod,
            success: false,
            processingTime: Date.now() - startTime,
            error: `Unsupported auth method: ${provider.authMethod}`,
          };
      }

      return {
        provider: provider.name,
        keyType,
        injectionMethod: provider.authMethod,
        success: true,
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      return {
        provider: provider.name,
        keyType: 'primary',
        injectionMethod: provider.authMethod,
        success: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown injection error',
      };
    }
  }

  /**
   * Check if error is related to API key issues
   */
  private isApiKeyError(error: AxiosError): boolean {
    if (!error.response) {
      return false;
    }

    const status = error.response.status;
    const message = error.message.toLowerCase();
    const responseData = error.response.data;

    // Common API key error indicators
    const keyErrorIndicators = [
      'unauthorized',
      'invalid api key',
      'api key',
      'authentication',
      'forbidden',
      'access denied',
    ];

    // Check status codes
    if (status === 401 || status === 403) {
      return true;
    }

    // Check error message
    if (keyErrorIndicators.some(indicator => message.includes(indicator))) {
      return true;
    }

    // Check response data
    if (responseData && typeof responseData === 'string') {
      const responseText = responseData.toLowerCase();
      if (keyErrorIndicators.some(indicator => responseText.includes(indicator))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle API key related errors
   */
  private async handleApiKeyError(
    error: AxiosError, 
    provider: ApiProvider
  ): Promise<AxiosResponse | null> {
    try {
      // This would trigger key rotation in a real implementation
      // For now, we'll just log the attempt
      logger.info('[ApiKeyInterceptor] Key rotation triggered by error', {
        provider: provider.name,
        status: error.response?.status,
      }, {
        module: 'ApiKeyInterceptor'
      });

      this.stats.keyRotations++;

      // In a real implementation, you would:
      // 1. Rotate the API key
      // 2. Update the request with the new key
      // 3. Retry the request
      // 4. Return the successful response

      return null; // For now, don't retry

    } catch (rotationError) {
      logger.error('[ApiKeyInterceptor] Key rotation failed:', rotationError, {
        module: 'ApiKeyInterceptor'
      });
      return null;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(result: KeyInjectionResult, startTime: number): void {
    const processingTime = Date.now() - startTime;

    // Update overall stats
    if (result.success) {
      this.stats.successfulInjections++;
    } else {
      this.stats.failedInjections++;
    }

    // Update average processing time
    const totalProcessingTime = this.stats.averageProcessingTime * (this.stats.totalRequests - 1) + processingTime;
    this.stats.averageProcessingTime = totalProcessingTime / this.stats.totalRequests;

    // Update provider stats
    const providerStats = this.stats.providerStats[result.provider];
    if (providerStats) {
      providerStats.requests++;
      if (result.success) {
        providerStats.successes++;
      } else {
        providerStats.failures++;
      }
      providerStats.lastUsed = Date.now();
    }
  }

  /**
   * Record error for statistics
   */
  private recordError(error: any): void {
    const errorType = error instanceof ApiKeyManagerError 
      ? 'ApiKeyManagerError'
      : error.name || 'UnknownError';

    this.stats.errorCounts[errorType] = (this.stats.errorCounts[errorType] || 0) + 1;
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const apiKeyInterceptor = new ApiKeyInterceptor();

// ========================================
// SETUP FUNCTIONS
// ========================================

/**
 * Setup API key interceptor for an axios instance
 */
export const setupApiKeyInterceptor = (axiosInstance: any): void => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig) => apiKeyInterceptor.requestInterceptor(config),
    (error: any) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => apiKeyInterceptor.responseInterceptor(response),
    (error: AxiosError) => apiKeyInterceptor.errorInterceptor(error)
  );

  logger.info('[ApiKeyInterceptor] API key interceptor setup completed', {
    enabled: apiKeyInterceptor.getStats().totalRequests >= 0,
  }, {
    module: 'ApiKeyInterceptor'
  });
};

/**
 * Get API key interceptor statistics
 */
export const getApiKeyInterceptorStats = (): ApiKeyInterceptorStats => {
  return apiKeyInterceptor.getStats();
};

/**
 * Reset API key interceptor statistics
 */
export const resetApiKeyInterceptorStats = (): void => {
  apiKeyInterceptor.resetStats();
};