/**
 * API Configuration
 * Consolidated configuration for API client with validation
 */

import Constants from "expo-constants";
import { logger } from "../utils/sys/log";
import { getEnv } from "@core/config/environment";

// ========================================
// URL VALIDATION & FORMATTING
// ========================================

/**
 * Validates and formats API URL to ensure proper structure
 */
function formatApiUrl(url: string): string {
  if (!url) {
    throw new Error('API URL cannot be empty');
  }

  // Make sure URL has proper protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url; // Default to HTTPS for security
  }

  // Remove trailing slash for consistency
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Get validated API URL from environment
 */
const getValidatedApiUrl = (): string => {
  // Try multiple sources for API URL
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 
                  Constants.expoConfig?.extra?.apiUrl ||
                  process.env.EXPO_PUBLIC_API_URL;
  
  // Get API version
  const apiVersion = process.env.EXPO_PUBLIC_API_VERSION || 
                     Constants.expoConfig?.extra?.apiVersion ||
                     'api/v1';
  
  if (!baseUrl) {
    console.error("API URL is not configured in app.json or environment variables");
    // Provide a fallback for development
    if (__DEV__) {
      console.warn("Using fallback API URL for development");
      return "http://localhost:5000/api/v1";
    }
    throw new Error("API URL configuration is missing");
  }

  // Production safety check - prevent localhost in production builds
  if (!__DEV__ && baseUrl.includes('localhost')) {
    const error = "Localhost URLs not allowed in production builds";
    logger.error(error, { apiUrl: baseUrl }, { module: "ApiConfig" });
    throw new Error(error);
  }

  // Validate URL format
  try {
    new URL(baseUrl);
    const formattedBaseUrl = formatApiUrl(baseUrl);
    
    // Append API version if not already included
    const fullUrl = formattedBaseUrl.includes('/api/') 
      ? formattedBaseUrl 
      : `${formattedBaseUrl}/${apiVersion}`;
    
    logger.info("API Base URL configured", { 
      baseUrl: formattedBaseUrl, 
      apiVersion, 
      fullUrl 
    }, { module: "ApiConfig" });
    
    return fullUrl;
  } catch (error) {
    console.error(`Invalid API URL format: ${baseUrl}`);
    throw new Error(`Invalid API URL: ${baseUrl}`);
  }
};

// ========================================
// API CONFIGURATION
// ========================================

export const API_CONFIG = {
  baseURL: getValidatedApiUrl(),
  timeout: 15000,
  maxRetries: 3,
  initialRetryDelay: 1000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "ngrok-skip-browser-warning": "true",
  }
} as const;

// ========================================
// CURRENCY API CONFIGURATION
// ========================================

export const CURRENCY_API_CONFIG = {
  // Primary API - ExchangeRate-API
  PRIMARY: {
    BASE_URL: 'https://v6.exchangerate-api.com/v6',
    FREE_API_KEY: getEnv('EXCHANGE_RATE_API_KEY'),
    ENDPOINTS: {
      LATEST: (apiKey: string, baseCurrency: string = 'USD') => 
        `${CURRENCY_API_CONFIG.PRIMARY.BASE_URL}/${apiKey}/latest/${baseCurrency}`,
      CONVERT: (apiKey: string, from: string, to: string, amount: number) =>
        `${CURRENCY_API_CONFIG.PRIMARY.BASE_URL}/${apiKey}/pair/${from}/${to}/${amount}`,
      HISTORICAL: (apiKey: string, baseCurrency: string, year: number, month: number, day: number) =>
        `${CURRENCY_API_CONFIG.PRIMARY.BASE_URL}/${apiKey}/history/${baseCurrency}/${year}/${month}/${day}`,
      SUPPORTED: (apiKey: string) =>
        `${CURRENCY_API_CONFIG.PRIMARY.BASE_URL}/${apiKey}/codes`
    },
    RATE_LIMITS: {
      FREE: 1500, // requests per month
      PRO: 30000,  // requests per month
    }
  },
  
  // Fallback API - CurrencyAPI
  FALLBACK: {
    BASE_URL: 'https://api.currencyapi.com/v3',
    FREE_API_KEY: getEnv('CURRENCY_API_KEY'),
    ENDPOINTS: {
      LATEST: (apiKey: string, baseCurrency: string = 'USD') =>
        `${CURRENCY_API_CONFIG.FALLBACK.BASE_URL}/latest?apikey=${apiKey}&base_currency=${baseCurrency}`,
      CONVERT: (apiKey: string, from: string, to: string, amount: number) =>
        `${CURRENCY_API_CONFIG.FALLBACK.BASE_URL}/latest?apikey=${apiKey}&base_currency=${from}&currencies=${to}`,
      HISTORICAL: (apiKey: string, baseCurrency: string, date: string) =>
        `${CURRENCY_API_CONFIG.FALLBACK.BASE_URL}/historical?apikey=${apiKey}&base_currency=${baseCurrency}&date=${date}`,
      SUPPORTED: (apiKey: string) =>
        `${CURRENCY_API_CONFIG.FALLBACK.BASE_URL}/currencies?apikey=${apiKey}`
    },
    RATE_LIMITS: {
      FREE: 300, // requests per month
    }
  },
  
  // Cache configuration
  CACHE: {
    DURATION_MS: getEnv('CACHE_TTL'), // Use environment cache TTL
    FALLBACK_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours for fallback cache
    KEYS: {
      RATES: 'currency_exchange_rates_v2',
      RATES_EXPIRY: 'currency_exchange_rates_expiry_v2',
      SUPPORTED_CURRENCIES: 'supported_currencies_v2',
      API_USAGE: 'currency_api_usage_v2'
    }
  },
  
  // Supported currencies for the app
  SUPPORTED_CURRENCIES: [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'AED',
    'SAR', 'HKD', 'SGD', 'MXN', 'BRL', 'KRW', 'ZAR', 'NZD', 'SEK', 'NOK',
    'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'TRY', 'THB', 'MYR', 'IDR', 'PHP'
  ] as const,
  
  // Rate limiting and retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    EXPONENTIAL_BACKOFF: true
  }
} as const;

// ========================================
// REQUEST VALIDATION
// ========================================

/**
 * Validates API request configuration
 */
export const validateRequest = (config: any): boolean => {
  if (!config.url && !config.baseURL) {
    console.error("Request missing URL or baseURL");
    return false;
  }
  
  return true;
};

// ========================================
// ERROR CLASSIFICATION
// ========================================

export interface ErrorClassification {
  type: 'network' | 'server' | 'client' | 'auth' | 'validation';
  retry: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Classifies API errors for appropriate handling
 */
export const classifyError = (error: any): ErrorClassification => {
  // Network errors
  if (!error.response) {
    return {
      type: 'network',
      retry: true,
      severity: 'high'
    };
  }

  const status = error.response.status;

  // Server errors (5xx)
  if (status >= 500) {
    return {
      type: 'server',
      retry: true,
      severity: status >= 503 ? 'critical' : 'high'
    };
  }

  // Authentication errors (401, 403)
  if (status === 401 || status === 403) {
    return {
      type: 'auth',
      retry: false,
      severity: 'high'
    };
  }

  // Validation errors (400, 422)
  if (status === 400 || status === 422) {
    return {
      type: 'validation',
      retry: false,
      severity: 'medium'
    };
  }

  // Rate limiting (429)
  if (status === 429) {
    return {
      type: 'server',
      retry: true,
      severity: 'medium'
    };
  }

  // Other client errors (4xx)
  if (status >= 400 && status < 500) {
    return {
      type: 'client',
      retry: false,
      severity: 'low'
    };
  }

  // Unknown errors
  return {
    type: 'server',
    retry: false,
    severity: 'medium'
  };
};

// Log configuration in development only
if (__DEV__) {
  console.log("API Base URL:", API_CONFIG.baseURL);
  console.log("IMPORTANT: The baseURL includes the API version - don't add /api/v1 in endpoint paths");
} 