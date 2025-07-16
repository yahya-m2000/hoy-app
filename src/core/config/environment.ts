/**
 * Environment Configuration
 * 
 * Centralized environment variable management with:
 * - Type-safe configuration
 * - Validation and defaults
 * - Production/development separation
 * - Runtime configuration updates
 * 
 * @module @core/config/environment
 * @author Hoy Development Team
 * @version 1.0.0
 */

import Constants from 'expo-constants';

// ========================================
// TYPES
// ========================================

export interface EnvironmentConfig {
  // API Configuration
  API_URL: string;
  WS_URL: string;
  API_TIMEOUT: number;
  
  // External API Keys
  EXCHANGE_RATE_API_KEY: string;
  CURRENCY_API_KEY: string;
  MAPBOX_API_KEY: string;
  ANALYTICS_API_KEY: string;
  
  // SSO Configuration
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_CLIENT_TOKEN: string;
  
  // Feature Flags
  ENABLE_DEBUG_COMPONENTS: boolean;
  ENABLE_VERBOSE_LOGGING: boolean;
  ENABLE_MEMORY_MONITORING: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  
  // Security Configuration
  ENABLE_CERTIFICATE_PINNING: boolean;
  ENABLE_CSRF_PROTECTION: boolean;
  ENABLE_SESSION_MANAGEMENT: boolean;
  ENABLE_API_KEY_ROTATION: boolean;
  ENABLE_TOKEN_ENCRYPTION: boolean;
  
  // Request Signing Configuration
  REQUEST_SIGNING_SECRET: string;
  REQUEST_SIGNING_SECRET_ID: string;
  
  // Performance Configuration
  CACHE_TTL: number;
  SESSION_TTL: number;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // App Configuration
  APP_NAME: string;
  APP_VERSION: string;
  BUILD_NUMBER: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

// ========================================
// DEFAULTS
// ========================================

const PRODUCTION_DEFAULTS: Partial<EnvironmentConfig> = {
  API_TIMEOUT: 30000,
  ENABLE_DEBUG_COMPONENTS: false,
  ENABLE_VERBOSE_LOGGING: false,
  ENABLE_MEMORY_MONITORING: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_CERTIFICATE_PINNING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_SESSION_MANAGEMENT: true,
  ENABLE_API_KEY_ROTATION: true,
  ENABLE_TOKEN_ENCRYPTION: true,
  CACHE_TTL: 3600000, // 1 hour
  SESSION_TTL: 43200000, // 12 hours
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
};

const DEVELOPMENT_DEFAULTS: Partial<EnvironmentConfig> = {
  API_TIMEOUT: 60000,
  ENABLE_DEBUG_COMPONENTS: true,
  ENABLE_VERBOSE_LOGGING: true,
  ENABLE_MEMORY_MONITORING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_CERTIFICATE_PINNING: false,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_SESSION_MANAGEMENT: true,
  ENABLE_API_KEY_ROTATION: false,
  ENABLE_TOKEN_ENCRYPTION: true,
  CACHE_TTL: 300000, // 5 minutes
  SESSION_TTL: 3600000, // 1 hour
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 1000,
};

// ========================================
// CONFIGURATION LOADER
// ========================================

class EnvironmentManager {
  private config: EnvironmentConfig;
  
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }
  
  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): EnvironmentConfig {
    const isDev = __DEV__;
    const defaults = isDev ? DEVELOPMENT_DEFAULTS : PRODUCTION_DEFAULTS;
    
    // Get environment from Expo config or process.env
    const environment = (
      Constants.expoConfig?.extra?.environment ||
      process.env.EXPO_PUBLIC_ENVIRONMENT ||
      (isDev ? 'development' : 'production')
    ) as 'development' | 'staging' | 'production';
    
    return {
      // API Configuration
      // Order: EXPO_PUBLIC_API_URL, extra.apiUrl, fallback (matches api.config.ts)
      API_URL: process.env.EXPO_PUBLIC_API_URL || 
               Constants.expoConfig?.extra?.apiUrl ||
               (isDev ? 'http://localhost:5000/api/v1' : ''),
      WS_URL: process.env.EXPO_PUBLIC_WS_URL ||
              Constants.expoConfig?.extra?.wsUrl ||
              (isDev ? 'ws://localhost:5000/ws' : ''),
      API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '') || defaults.API_TIMEOUT!,
      
      // External API Keys
        EXCHANGE_RATE_API_KEY: process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY || '',
  CURRENCY_API_KEY: process.env.EXPO_PUBLIC_CURRENCY_API_KEY || '',
  MAPBOX_API_KEY: process.env.EXPO_PUBLIC_MAPBOX_API_KEY || '',
  ANALYTICS_API_KEY: process.env.EXPO_PUBLIC_ANALYTICS_API_KEY || '',
  // SSO Configuration
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
  FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
  FACEBOOK_CLIENT_TOKEN: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || '',
      
      // Feature Flags
      ENABLE_DEBUG_COMPONENTS: process.env.EXPO_PUBLIC_ENABLE_DEBUG_COMPONENTS === 'true' || defaults.ENABLE_DEBUG_COMPONENTS!,
      ENABLE_VERBOSE_LOGGING: process.env.EXPO_PUBLIC_ENABLE_VERBOSE_LOGGING === 'true' || defaults.ENABLE_VERBOSE_LOGGING!,
      ENABLE_MEMORY_MONITORING: process.env.EXPO_PUBLIC_ENABLE_MEMORY_MONITORING === 'true' || defaults.ENABLE_MEMORY_MONITORING!,
      ENABLE_PERFORMANCE_MONITORING: process.env.EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING !== 'false' && defaults.ENABLE_PERFORMANCE_MONITORING!,
      
      // Security Configuration
      ENABLE_CERTIFICATE_PINNING: process.env.EXPO_PUBLIC_ENABLE_CERTIFICATE_PINNING !== 'false' && defaults.ENABLE_CERTIFICATE_PINNING!,
      ENABLE_CSRF_PROTECTION: process.env.EXPO_PUBLIC_ENABLE_CSRF_PROTECTION !== 'false' && defaults.ENABLE_CSRF_PROTECTION!,
      ENABLE_SESSION_MANAGEMENT: process.env.EXPO_PUBLIC_ENABLE_SESSION_MANAGEMENT !== 'false' && defaults.ENABLE_SESSION_MANAGEMENT!,
      ENABLE_API_KEY_ROTATION: process.env.EXPO_PUBLIC_ENABLE_API_KEY_ROTATION === 'true' || defaults.ENABLE_API_KEY_ROTATION!,
      ENABLE_TOKEN_ENCRYPTION: process.env.EXPO_PUBLIC_ENABLE_TOKEN_ENCRYPTION !== 'false' && defaults.ENABLE_TOKEN_ENCRYPTION!,
      
      // Request Signing Configuration
      REQUEST_SIGNING_SECRET: process.env.EXPO_PUBLIC_REQUEST_SIGNING_SECRET || '',
      REQUEST_SIGNING_SECRET_ID: process.env.EXPO_PUBLIC_REQUEST_SIGNING_SECRET_ID || '',
      
      // Performance Configuration
      CACHE_TTL: parseInt(process.env.EXPO_PUBLIC_CACHE_TTL || '') || defaults.CACHE_TTL!,
      SESSION_TTL: parseInt(process.env.EXPO_PUBLIC_SESSION_TTL || '') || defaults.SESSION_TTL!,
      RATE_LIMIT_WINDOW: parseInt(process.env.EXPO_PUBLIC_RATE_LIMIT_WINDOW || '') || defaults.RATE_LIMIT_WINDOW!,
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.EXPO_PUBLIC_RATE_LIMIT_MAX_REQUESTS || '') || defaults.RATE_LIMIT_MAX_REQUESTS!,
      
      // App Configuration
      APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || Constants.expoConfig?.name || 'HOY',
      APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || Constants.expoConfig?.version || '1.0.0',
      BUILD_NUMBER: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
      ENVIRONMENT: environment,
      IS_PRODUCTION: environment === 'production',
      IS_DEVELOPMENT: environment === 'development',
    };
  }
  
  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate required fields
    if (!this.config.API_URL) {
      errors.push('API_URL is not configured');
    } else if (this.config.IS_PRODUCTION && (this.config.API_URL.includes('localhost') || this.config.API_URL.includes('ngrok'))) {
      errors.push('Production API_URL cannot be localhost or ngrok');
    }
    
    // Validate optional fields for production
    if (this.config.IS_PRODUCTION) {
      if (!this.config.EXCHANGE_RATE_API_KEY) {
        warnings.push('EXCHANGE_RATE_API_KEY is not configured - currency conversion features will be limited');
      }
      
      if (!this.config.CURRENCY_API_KEY) {
        warnings.push('CURRENCY_API_KEY is not configured - fallback currency API will not be available');
      }
      
      if (!this.config.MAPBOX_API_KEY) {
        warnings.push('MAPBOX_API_KEY is not configured - map features will be limited');
      }
    }
    
    // Log warnings
    if (warnings.length > 0) {
      console.warn('[Environment] Configuration warnings:', warnings, {
        module: 'Environment'
      });
    }
    
    // Log validation results
    if (errors.length > 0) {
      console.error('[Environment] Configuration validation failed:', errors, {
        module: 'Environment'
      });
      
      // Only throw in production if there are critical errors
      if (this.config.IS_PRODUCTION) {
        throw new Error(`Environment configuration invalid: ${errors.join(', ')}`);
      }
    } else {
      console.info('[Environment] Configuration validated successfully', {
        environment: this.config.ENVIRONMENT,
        apiUrl: this.config.API_URL ? this.config.API_URL.substring(0, 30) + '...' : 'not configured',
      }, {
        module: 'Environment'
      });
    }
  }
  
  /**
   * Get configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }
  
  /**
   * Get full configuration
   */
  public getConfig(): Readonly<EnvironmentConfig> {
    return { ...this.config };
  }
  
  /**
   * Update configuration (development only)
   */
  public updateConfig(updates: Partial<EnvironmentConfig>): void {
    if (this.config.IS_PRODUCTION) {
      console.warn('[Environment] Cannot update configuration in production', undefined, {
        module: 'Environment'
      });
      return;
    }
    
    this.config = { ...this.config, ...updates };
    this.validateConfiguration();
    
    console.info('[Environment] Configuration updated', {
      updates: Object.keys(updates),
    }, {
      module: 'Environment'
    });
  }
  
  /**
   * Check if feature is enabled
   */
  public isFeatureEnabled(feature: keyof EnvironmentConfig): boolean {
    const value = this.config[feature];
    return typeof value === 'boolean' ? value : false;
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const Environment = new EnvironmentManager();

// ========================================
// CONVENIENCE EXPORTS
// ========================================

export const getEnv = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] => {
  return Environment.get(key);
};

export const getConfig = (): Readonly<EnvironmentConfig> => {
  return Environment.getConfig();
};

export const isProduction = (): boolean => {
  return Environment.get('IS_PRODUCTION');
};

export const isDevelopment = (): boolean => {
  return Environment.get('IS_DEVELOPMENT');
};

export const isFeatureEnabled = (feature: keyof EnvironmentConfig): boolean => {
  return Environment.isFeatureEnabled(feature);
};