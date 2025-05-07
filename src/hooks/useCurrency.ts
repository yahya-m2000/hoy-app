/**
 * Custom hook for currency operations
 */

import { useContext } from "react";
import { CurrencyContext } from "../context/CurrencyContext";

interface CurrencySymbol {
  [key: string]: string;
}

export const useCurrency = () => {
  const { currency, setCurrency } = useContext(CurrencyContext);

  // Currency symbols map
  const currencySymbols: CurrencySymbol = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    RUB: "₽",
    SGD: "S$",
    AED: "د.إ",
    // Add more currencies as needed
  };

  /**
   * Get the symbol for a currency
   * @param currencyCode ISO currency code (e.g., "USD")
   * @returns Currency symbol (e.g., "$")
   */
  const getSymbol = (currencyCode: string = currency): string => {
    return currencySymbols[currencyCode] || currencyCode;
  };

  /**
   * Format amount with currency symbol
   * @param amount Amount to format
   * @param currencyCode ISO currency code (optional)
   * @returns Formatted amount with currency symbol
   */
  const formatAmount = (
    amount: number,
    currencyCode: string = currency
  ): string => {
    return `${getSymbol(currencyCode)}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Convert amount from one currency to another
   * NOTE: This is a simplified implementation, a real app would use an exchange rate API
   * @param amount Amount to convert
   * @param fromCurrency Source currency code
   * @param toCurrency Target currency code
   * @returns Converted amount
   */
  const convertAmount = (
    amount: number,
    fromCurrency: string = currency,
    toCurrency: string = currency
  ): number => {
    // Mock exchange rates for demonstration
    const exchangeRates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.91,
      GBP: 0.78,
      JPY: 153.4,
      AUD: 1.52,
      CAD: 1.35,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.5,
      RUB: 92.1,
      SGD: 1.34,
      AED: 3.67,
    };

    // If same currency or exchange rates not available, return original amount
    if (
      fromCurrency === toCurrency ||
      !exchangeRates[fromCurrency] ||
      !exchangeRates[toCurrency]
    ) {
      return amount;
    }

    // Convert to USD first (base currency), then to target currency
    const amountInUSD = amount / exchangeRates[fromCurrency];
    const amountInTargetCurrency = amountInUSD * exchangeRates[toCurrency];

    return amountInTargetCurrency;
  };

  return {
    currency,
    setCurrency,
    getSymbol,
    formatAmount,
    convertAmount,
  };
};
