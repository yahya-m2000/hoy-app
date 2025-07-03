/**
 * Production Currency Service for the Hoy application
 * Handles real-time currency exchange rate fetching with multiple API providers
 *
 * @module @core/external/currency
 * @author Hoy Development Team
 * @version 2.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../utils/sys/log";
import { CURRENCY_API_CONFIG } from "../config/api.config";

// ========================================
// TYPES & INTERFACES
// ========================================

interface ExchangeRatesResponse {
  success?: boolean;
  result?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  base_code?: string;
  conversion_rates?: Record<string, number>;
  // Fallback API format
  data?: Record<string, { code: string; value: number }>;
  meta?: {
    last_updated_at: string;
  };
}

interface ConversionResponse {
  success?: boolean;
  result?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  base_code?: string;
  target_code?: string;
  conversion_rate?: number;
  conversion_result?: number;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface ApiUsageStats {
  primaryApiCalls: number;
  fallbackApiCalls: number;
  lastReset: number;
  monthlyLimit: number;
}

// ========================================
// CURRENCY SERVICE CLASS
// ========================================

class CurrencyService {
  private isInitialized = false;
  private apiUsageStats: ApiUsageStats = {
    primaryApiCalls: 0,
    fallbackApiCalls: 0,
    lastReset: Date.now(),
    monthlyLimit: CURRENCY_API_CONFIG.PRIMARY.RATE_LIMITS.FREE
  };

  /**
   * Initialize the currency service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load API usage stats from storage
      const storedStats = await AsyncStorage.getItem(CURRENCY_API_CONFIG.CACHE.KEYS.API_USAGE);
      if (storedStats) {
        this.apiUsageStats = JSON.parse(storedStats);
        
        // Reset monthly counters if it's a new month
        const now = Date.now();
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (now - this.apiUsageStats.lastReset > oneMonth) {
          this.apiUsageStats.primaryApiCalls = 0;
          this.apiUsageStats.fallbackApiCalls = 0;
          this.apiUsageStats.lastReset = now;
          await this.saveApiUsageStats();
        }
      }

      this.isInitialized = true;
      logger.info("Currency service initialized", { 
        primaryApiCalls: this.apiUsageStats.primaryApiCalls,
        fallbackApiCalls: this.apiUsageStats.fallbackApiCalls
      });
    } catch (error) {
      logger.error("Failed to initialize currency service", error);
      this.isInitialized = true; // Continue with defaults
    }
  }

  /**
   * Save API usage statistics to storage
   */
  private async saveApiUsageStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CURRENCY_API_CONFIG.CACHE.KEYS.API_USAGE,
        JSON.stringify(this.apiUsageStats)
      );
    } catch (error) {
      logger.error("Failed to save API usage stats", error);
    }
  }

  /**
   * Check if we can make an API call within rate limits
   */
  private canMakeApiCall(useFallback = false): boolean {
    const stats = this.apiUsageStats;
    
    if (useFallback) {
      return stats.fallbackApiCalls < CURRENCY_API_CONFIG.FALLBACK.RATE_LIMITS.FREE;
    }
    
    return stats.primaryApiCalls < CURRENCY_API_CONFIG.PRIMARY.RATE_LIMITS.FREE;
  }

  /**
   * Increment API usage counter
   */
  private async incrementApiUsage(useFallback = false): Promise<void> {
    if (useFallback) {
      this.apiUsageStats.fallbackApiCalls++;
    } else {
      this.apiUsageStats.primaryApiCalls++;
    }
    
    await this.saveApiUsageStats();
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(url: string, retryCount = 0): Promise<T> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Hoy-Mobile-App/1.0.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      const maxRetries = CURRENCY_API_CONFIG.RETRY.MAX_ATTEMPTS;
      
      if (retryCount < maxRetries) {
        const delay = CURRENCY_API_CONFIG.RETRY.DELAY_MS * 
          (CURRENCY_API_CONFIG.RETRY.EXPONENTIAL_BACKOFF ? Math.pow(2, retryCount) : 1);
        
        logger.warn(`API request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Fetch exchange rates from primary API (ExchangeRate-API)
   */
  private async fetchFromPrimaryApi(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    const apiKey = CURRENCY_API_CONFIG.PRIMARY.FREE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Primary API key not configured. Please set EXPO_PUBLIC_EXCHANGE_RATE_API_KEY');
    }

    if (!this.canMakeApiCall(false)) {
      throw new Error('Primary API rate limit exceeded');
    }

    const url = CURRENCY_API_CONFIG.PRIMARY.ENDPOINTS.LATEST(apiKey, baseCurrency);
    const response = await this.makeRequest<ExchangeRatesResponse>(url);

    await this.incrementApiUsage(false);

    if (response.result !== 'success' || !response.conversion_rates) {
      throw new Error(`Primary API error: ${response.result || 'Unknown error'}`);
    }

    return response.conversion_rates;
  }

  /**
   * Fetch exchange rates from fallback API (CurrencyAPI)
   */
  private async fetchFromFallbackApi(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    const apiKey = CURRENCY_API_CONFIG.FALLBACK.FREE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Fallback API key not configured. Please set EXPO_PUBLIC_CURRENCY_API_KEY');
    }

    if (!this.canMakeApiCall(true)) {
      throw new Error('Fallback API rate limit exceeded');
    }

    const url = CURRENCY_API_CONFIG.FALLBACK.ENDPOINTS.LATEST(apiKey, baseCurrency);
    const response = await this.makeRequest<ExchangeRatesResponse>(url);

    await this.incrementApiUsage(true);

    if (!response.data) {
      throw new Error('Fallback API error: No data received');
    }

    // Convert fallback API format to standard format
    const rates: Record<string, number> = {};
    Object.entries(response.data).forEach(([code, info]) => {
      rates[code] = info.value;
    });

    return rates;
  }

  /**
   * Get current exchange rates with fallback mechanism
   */
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    await this.initialize();

    try {
      // Check cache first
      const cacheKey = `${CURRENCY_API_CONFIG.CACHE.KEYS.RATES}_${baseCurrency}`;
      const cachedRates = await AsyncStorage.getItem(cacheKey);
      const cachedExpiryStr = await AsyncStorage.getItem(`${cacheKey}_expiry`);
      const cachedExpiry = cachedExpiryStr ? parseInt(cachedExpiryStr, 10) : 0;

      // Return cached data if still valid
      if (cachedRates && cachedExpiry > Date.now()) {
        logger.info("Using cached exchange rates", { baseCurrency, cacheAge: Date.now() - (cachedExpiry - CURRENCY_API_CONFIG.CACHE.DURATION_MS) });
        return JSON.parse(cachedRates);
      }

      let rates: Record<string, number> = {};
      let apiUsed = 'none';

      // Try primary API first
      try {
        rates = await this.fetchFromPrimaryApi(baseCurrency);
        apiUsed = 'primary';
        logger.info("Fetched rates from primary API", { baseCurrency, rateCount: Object.keys(rates).length });
      } catch (primaryError) {
        logger.warn("Primary API failed, trying fallback", primaryError);
        
        // Try fallback API
        try {
          rates = await this.fetchFromFallbackApi(baseCurrency);
          apiUsed = 'fallback';
          logger.info("Fetched rates from fallback API", { baseCurrency, rateCount: Object.keys(rates).length });
        } catch (fallbackError) {
          logger.error("Both APIs failed", { primaryError, fallbackError });
          
          // Use expired cache if available
          if (cachedRates) {
            logger.warn("Using expired cached rates as last resort", { baseCurrency });
            return JSON.parse(cachedRates);
          }
          
          throw new Error('All currency APIs failed and no cached data available');
        }
      }

      // Cache the fresh rates
      const cacheExpiry = Date.now() + CURRENCY_API_CONFIG.CACHE.DURATION_MS;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(rates));
      await AsyncStorage.setItem(`${cacheKey}_expiry`, cacheExpiry.toString());

      logger.info("Exchange rates updated and cached", { 
        baseCurrency, 
        apiUsed, 
        rateCount: Object.keys(rates).length,
        cacheExpiry: new Date(cacheExpiry).toISOString()
      });

      return rates;
    } catch (error) {
      logger.error("Failed to get exchange rates", error);
      
      // Return empty rates as last resort (will result in 1:1 conversion)
      return {};
    }
  }

  /**
   * Convert currency amount using real-time rates
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // Same currency, no conversion needed
    if (fromCurrency === toCurrency) return amount;

    // Validate amount
    if (isNaN(amount) || amount < 0) {
      throw new Error('Invalid amount for currency conversion');
    }

    try {
      // Get exchange rates (using USD as base)
      const rates = await this.getExchangeRates('USD');
      
      if (Object.keys(rates).length === 0) {
        logger.warn("No exchange rates available, returning original amount");
        return amount;
      }

      // Get rates for both currencies
      const fromRate = fromCurrency === 'USD' ? 1 : rates[fromCurrency];
      const toRate = toCurrency === 'USD' ? 1 : rates[toCurrency];

      if (!fromRate || !toRate) {
        const missingCurrency = !fromRate ? fromCurrency : toCurrency;
        logger.warn(`Exchange rate not available for ${missingCurrency}`, { 
          availableCurrencies: Object.keys(rates).slice(0, 10) 
        });
        return amount;
      }

      // Convert: amount -> USD -> target currency
      const amountInUSD = amount / fromRate;
      const convertedAmount = amountInUSD * toRate;

      logger.debug("Currency conversion completed", {
        amount,
        fromCurrency,
        toCurrency,
        fromRate,
        toRate,
        convertedAmount: Number(convertedAmount.toFixed(2))
      });

      return Number(convertedAmount.toFixed(2));
    } catch (error) {
      logger.error("Currency conversion failed", error);
      return amount; // Return original amount on error
    }
  }

  /**
   * Get supported currencies with their info
   */
  async getSupportedCurrencies(): Promise<CurrencyInfo[]> {
    // Extended currency information
    const currencyInfo: Record<string, CurrencyInfo> = {
      USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
      EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
      GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
      JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
      SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
      HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
      SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
      MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
      BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
      KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
      ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
      NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
      SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
      NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
      DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
      PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
      CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
      HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
      RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
      TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
      THB: { code: 'THB', name: 'Thai Baht', symbol: '฿' },
      MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
      IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
      PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱' }
    };

    return CURRENCY_API_CONFIG.SUPPORTED_CURRENCIES.map(code => 
      currencyInfo[code] || { code, name: code, symbol: code }
    );
  }

  /**
   * Format amount with currency symbol using Intl.NumberFormat
   */
  formatAmount(amount: number, currencyCode: string): string {
    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formatter.format(amount);
    } catch (error) {
      logger.warn(`Failed to format amount for currency ${currencyCode}`, error);
      
      // Fallback formatting
      const currencyInfo = CURRENCY_API_CONFIG.SUPPORTED_CURRENCIES
        .find(code => code === currencyCode);
      
      const symbol = currencyInfo ? this.getCurrencySymbol(currencyCode) : currencyCode;
      return `${symbol}${amount.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
  }

  /**
   * Get currency symbol for a currency code
   */
  private getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$',
      CHF: 'CHF', CNY: '¥', INR: '₹', AED: 'د.إ', SAR: 'ر.س', HKD: 'HK$',
      SGD: 'S$', MXN: '$', BRL: 'R$', KRW: '₩', ZAR: 'R', NZD: 'NZ$',
      SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft',
      RUB: '₽', TRY: '₺', THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱'
    };
    
    return symbols[currencyCode] || currencyCode;
  }

  /**
   * Get API usage statistics
   */
  getApiUsageStats(): ApiUsageStats {
    return { ...this.apiUsageStats };
  }

  /**
   * Clear all cached data (useful for testing or manual refresh)
   */
  async clearCache(): Promise<void> {
    try {
      const cacheKeys = Object.values(CURRENCY_API_CONFIG.CACHE.KEYS);
      
      // Also clear currency-specific caches
      const allKeys = await AsyncStorage.getAllKeys();
      const currencyCacheKeys = allKeys.filter(key => 
        key.startsWith(CURRENCY_API_CONFIG.CACHE.KEYS.RATES)
      );
      
      await AsyncStorage.multiRemove([...cacheKeys, ...currencyCacheKeys]);
      
      logger.info("Currency cache cleared", { clearedKeys: cacheKeys.length + currencyCacheKeys.length });
    } catch (error) {
      logger.error("Failed to clear currency cache", error);
    }
  }
}

// ========================================
// SINGLETON EXPORT
// ========================================

export const currencyService = new CurrencyService();

// ========================================
// TYPE EXPORTS
// ========================================

export type { CurrencyInfo, ApiUsageStats };
export { CURRENCY_API_CONFIG };
