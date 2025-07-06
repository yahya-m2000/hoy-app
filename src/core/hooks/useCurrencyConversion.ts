/**
 * Currency Conversion Hook
 * Provides currency conversion functionality with caching and error handling
 */

import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@core/context";
import { currencyService } from "@core/external/currency";
import { logger } from "@core/utils/sys/log";

interface ConversionCache {
  [key: string]: {
    amount: number;
    convertedAmount: number;
    timestamp: number;
  };
}

export const useCurrencyConversion = () => {
  const { currency } = useCurrency();
  const [conversionCache, setConversionCache] = useState<ConversionCache>({});
  const [isLoading, setIsLoading] = useState(false);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Convert amount from USD to current currency
  const convertAmount = useCallback(async (
    amount: number,
    fromCurrency: string = "USD"
  ): Promise<number> => {
    // Same currency, no conversion needed
    if (fromCurrency === currency) {
      return amount;
    }

    // Check cache first
    const cacheKey = `${amount}-${fromCurrency}-${currency}`;
    const cached = conversionCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.convertedAmount;
    }

    try {
      setIsLoading(true);
      const convertedAmount = await currencyService.convertCurrency(
        amount,
        fromCurrency,
        currency
      );

      // Cache the result
      setConversionCache(prev => ({
        ...prev,
        [cacheKey]: {
          amount,
          convertedAmount,
          timestamp: Date.now()
        }
      }));



      return convertedAmount;
    } catch (error) {
      logger.error("Currency conversion failed", error);
      // Return original amount on error
      return amount;
    } finally {
      setIsLoading(false);
    }
  }, [currency, conversionCache]);

  // Convert multiple amounts at once
  const convertAmounts = useCallback(async (
    amounts: { amount: number; fromCurrency?: string }[]
  ): Promise<number[]> => {
    const results = await Promise.all(
      amounts.map(({ amount, fromCurrency = "USD" }) => 
        convertAmount(amount, fromCurrency)
      )
    );
    return results;
  }, [convertAmount]);

  // Clear cache
  const clearCache = useCallback(() => {
    setConversionCache({});
  }, []);

  // Clear expired cache entries
  useEffect(() => {
    const now = Date.now();
    const expiredKeys = Object.keys(conversionCache).filter(
      key => now - conversionCache[key].timestamp > CACHE_DURATION
    );

    if (expiredKeys.length > 0) {
      setConversionCache(prev => {
        const newCache = { ...prev };
        expiredKeys.forEach(key => delete newCache[key]);
        return newCache;
      });
    }
  }, [conversionCache]);

  return {
    convertAmount,
    convertAmounts,
    clearCache,
    isLoading,
    currentCurrency: currency
  };
}; 