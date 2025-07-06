/**
 * Currency Context for the Hoy application
 *
 * @module @core/context/CurrencyContext
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../utils/sys/log";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";
import { currencyService } from "../external/currency";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyContextProps {
  currency: string;
  setCurrency: (currency: string) => void;
  // Enhanced interface for modal compatibility
  currentCurrency: string;
  changeCurrency: (currency: string) => Promise<void>;
  supportedCurrencies: CurrencyInfo[];
}

export const CurrencyContext = createContext<CurrencyContextProps>({
  currency: "USD",
  setCurrency: () => {},
  currentCurrency: "USD",
  changeCurrency: async () => {},
  supportedCurrencies: [],
});

interface CurrencyProviderProps {
  children: ReactNode;
}

const CurrencyProviderInternal: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<string>("USD");
  const [supportedCurrencies, setSupportedCurrencies] = useState<
    CurrencyInfo[]
  >([]);

  // Load saved currency preference and supported currencies on mount
  useEffect(() => {
    const loadCurrencyData = async () => {
      try {
        // Load saved currency
        const savedCurrency = await AsyncStorage.getItem("@currency");
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }

        // Load supported currencies
        const currencies = await currencyService.getSupportedCurrencies();
        setSupportedCurrencies(currencies);
      } catch (error) {
        logger.error("Failed to load currency data:", error);
        // Set default currencies if API fails
        setSupportedCurrencies([
          { code: "USD", name: "US Dollar", symbol: "$" },
          { code: "EUR", name: "Euro", symbol: "€" },
          { code: "GBP", name: "British Pound", symbol: "£" },
          { code: "JPY", name: "Japanese Yen", symbol: "¥" },
        ]);
      }
    };

    loadCurrencyData();
  }, []);

  // Save currency preference when changed
  const handleSetCurrency = async (newCurrency: string) => {
    try {
      await AsyncStorage.setItem("@currency", newCurrency);
      setCurrency(newCurrency);
    } catch (error) {
      logger.error("Failed to save currency preference:", error);
    }
  };

  // Enhanced change currency function for modal compatibility
  const changeCurrency = async (newCurrency: string) => {
    try {
      await AsyncStorage.setItem("@currency", newCurrency);
      setCurrency(newCurrency);
      logger.info("Currency changed successfully", { newCurrency });
    } catch (error) {
      logger.error("Failed to change currency:", error);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        currentCurrency: currency,
        changeCurrency,
        supportedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
}) => (
  <ContextErrorBoundary
    contextName="Currency"
    critical={false}
    enableRetry={true}
    maxRetries={3}
  >
    <CurrencyProviderInternal>{children}</CurrencyProviderInternal>
  </ContextErrorBoundary>
);

export const useCurrency = () => {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
