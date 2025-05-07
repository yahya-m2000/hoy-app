/**
 * Currency Context for the Hoy application
 */

import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
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
        console.error("Failed to load currency preference:", error);
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
      console.error("Failed to save currency preference:", error);
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
