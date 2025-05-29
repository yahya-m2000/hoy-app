/**
 * Currency Service for the Hoy application
 * Handles currency exchange rate fetching and caching
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache the rates for 24 hours to avoid excessive API calls
const RATES_CACHE_KEY = "currency_exchange_rates";
const RATES_CACHE_EXPIRY_KEY = "currency_exchange_rates_expiry";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// interface ExchangeRatesResponse {
//   rates: Record<string, number>;
//   base: string;
//   date: string;
// }

class CurrencyService {
  /**
   * Get current exchange rates, using cached data if available and not expired
   */
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      // Check if we have cached rates
      const cachedRates = await AsyncStorage.getItem(RATES_CACHE_KEY);
      const cachedExpiryStr = await AsyncStorage.getItem(
        RATES_CACHE_EXPIRY_KEY
      );
      const cachedExpiry = cachedExpiryStr ? parseInt(cachedExpiryStr, 10) : 0;

      // If we have cached rates and they haven't expired, use them
      if (cachedRates && cachedExpiry > Date.now()) {
        return JSON.parse(cachedRates);
      }

      // Otherwise, fetch fresh rates
      const rates = await this.fetchExchangeRates();

      // Cache the rates and set expiry
      await AsyncStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
      await AsyncStorage.setItem(
        RATES_CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION_MS).toString()
      );

      return rates;
    } catch (error) {
      console.error("Failed to get exchange rates:", error);

      // If there was an error but we have cached rates (even if expired), use them as a fallback
      const cachedRates = await AsyncStorage.getItem(RATES_CACHE_KEY);
      if (cachedRates) {
        return JSON.parse(cachedRates);
      }

      // Otherwise, return an empty object (will default to 1:1 conversion)
      return {};
    }
  }

  /**
   * Fetch exchange rates from the API
   * We're using a mock implementation for now - in production, this would call an actual exchange rate API
   */
  private async fetchExchangeRates(): Promise<Record<string, number>> {
    try {
      // For now, using a mock service response
      // In production, this would be replaced with an actual API call:
      // const response = await api.get<ExchangeRatesResponse>('/exchange-rates');
      // return response.data.rates;

      // Mock exchange rates (relative to USD)
      const mockRates: Record<string, number> = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 151.26,
        AUD: 1.52,
        CAD: 1.36,
        CHF: 0.91,
        CNY: 7.26,
        INR: 83.47,
        AED: 3.67,
        SAR: 3.75,
        HKD: 7.81,
        SGD: 1.35,
        MXN: 16.73,
      };

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return mockRates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw new Error("Failed to fetch exchange rates");
    }
  }

  /**
   * Convert an amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) return amount;

    try {
      const rates = await this.getExchangeRates();

      // Base currency in our rates is USD
      const fromRate = fromCurrency === "USD" ? 1 : rates[fromCurrency] || 1;
      const toRate = toCurrency === "USD" ? 1 : rates[toCurrency] || 1;

      // Convert amount: first to USD, then to target currency
      const amountInUSD = amount / fromRate;
      const convertedAmount = amountInUSD * toRate;

      return Number(convertedAmount.toFixed(2));
    } catch (error) {
      console.error("Currency conversion error:", error);
      return amount; // Return original amount if conversion fails
    }
  }

  /**
   * Format an amount with the appropriate currency symbol
   */
  formatAmount(amount: number, currencyCode: string): string {
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    });

    return formatter.format(amount);
  }
}

export const currencyService = new CurrencyService();
