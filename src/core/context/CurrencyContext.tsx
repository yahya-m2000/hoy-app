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

interface CurrencyContextProps {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const CurrencyContext = createContext<CurrencyContextProps>({
  currency: "USD",
  setCurrency: () => {},
});

interface CurrencyProviderProps {
  children: ReactNode;
}

const CurrencyProviderInternal: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<string>("USD");

  // Load saved currency preference on mount
  useEffect(() => {
    const loadSavedCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem("@currency");
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch (error) {
        logger.error("Failed to load currency preference:", error);
      }
    };

    loadSavedCurrency();
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

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
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
