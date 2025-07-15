/**
 * Currency Conversion Hook
 * Provides currency conversion functionality with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
  const conversionCacheRef = useRef<ConversionCache>({});
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
    const cached = conversionCacheRef.current[cacheKey];
    
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
      conversionCacheRef.current = {
        ...conversionCacheRef.current,
        [cacheKey]: {
          amount,
          convertedAmount,
          timestamp: Date.now()
        }
      };



      return convertedAmount;
    } catch (error) {
      logger.error("Currency conversion failed", error);
      // Return original amount on error
      return amount;
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

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
    conversionCacheRef.current = {};
  }, []);

  // Clear expired cache entries
  useEffect(() => {
    const now = Date.now();
    const expiredKeys = Object.keys(conversionCacheRef.current).filter(
      key => now - conversionCacheRef.current[key].timestamp > CACHE_DURATION
    );

    if (expiredKeys.length > 0) {
      const newCache = { ...conversionCacheRef.current };
      expiredKeys.forEach(key => delete newCache[key]);
      conversionCacheRef.current = newCache;
    }
  }, []);

  return {
    convertAmount,
    convertAmounts,
    clearCache,
    isLoading,
    currentCurrency: currency
  };
}; 