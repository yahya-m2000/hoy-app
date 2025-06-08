/**
 * Currency Selection Modal for the Hoy application
 * Allows users to change their preferred currency for pricing display
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context and hooks
import { useTheme } from "@shared/context";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@shared/hooks";

// Components
import { BottomSheetModal, TextInput } from "@shared/components";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ExchangeRates {
  [key: string]: number;
}

// List of popular currencies
const popularCurrencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "₣", flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰" },
];

export default function CurrencyModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [ratesLoading, setRatesLoading] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(currency || "USD");
  const [searchText, setSearchText] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState(popularCurrencies);

  // Fetch exchange rates from a free API
  const fetchExchangeRates = async () => {
    setRatesLoading(true);
    try {
      // Using exchangerate-api.com (free tier allows 1500 requests/month)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      // Set fallback rates if API fails
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        AUD: 1.35,
        CAD: 1.25,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.5,
        AED: 3.67,
        SAR: 3.75,
        MXN: 17.5,
        SGD: 1.35,
        HKD: 7.8,
      });
    } finally {
      setRatesLoading(false);
    }
  };

  // Fetch exchange rates on component mount
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Get exchange rate display text
  const getExchangeRateDisplay = (currencyCode: string) => {
    if (!exchangeRates[currencyCode] || currencyCode === "USD") {
      return "";
    }

    const rate = exchangeRates[currencyCode];
    return `1 USD = ${rate.toFixed(2)} ${currencyCode}`;
  };

  // Filter currencies based on search
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredCurrencies(popularCurrencies);
      return;
    }

    const filtered = popularCurrencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(searchText.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  }, [searchText]);
  // Handle currency selection
  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setIsLoading(true);

    // Save selection to storage and update context
    try {
      await AsyncStorage.setItem("userCurrency", currencyCode);
      setCurrency(currencyCode);

      // Close modal and return to previous screen
      setTimeout(() => {
        setIsLoading(false);
        router.back();
      }, 300);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save currency preference:", error);
    }
  };
  // Render each currency option
  const renderCurrencyItem = ({ item }: { item: CurrencyOption }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        {
          backgroundColor:
            selectedCurrency === item.code
              ? isDark
                ? theme.colors.primaryPalette[200]
                : theme.colors.primary
              : "transparent",
          borderColor: isDark
            ? theme.colors.grayPalette[700]
            : theme.colors.grayPalette[300],
        },
      ]}
      onPress={() => handleCurrencyChange(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.currencyDetails}>
          <View style={styles.currencyMainInfo}>
            <Text
              style={[
                styles.currencyCode,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                  fontWeight: selectedCurrency === item.code ? "600" : "500",
                },
              ]}
            >
              {item.code}
            </Text>
            <Text
              style={[
                styles.currencySymbol,
                {
                  color:
                    selectedCurrency === item.code
                      ? theme.colors.primary
                      : isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.gray[600],
                },
              ]}
            >
              {item.symbol}
            </Text>
          </View>
          <Text
            style={[
              styles.currencyName,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.gray[600],
              },
            ]}
          >
            {item.name}
          </Text>
          {getExchangeRateDisplay(item.code) !== "" && (
            <Text
              style={[
                styles.exchangeRate,
                {
                  color: isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[500],
                },
              ]}
            >
              {ratesLoading ? "Loading..." : getExchangeRateDisplay(item.code)}
            </Text>
          )}
        </View>
      </View>
      {selectedCurrency === item.code && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.primary}
        />
      )}
    </TouchableOpacity>
  );
  return (
    <BottomSheetModal
      title={t("settings.selectCurrency")}
      showSaveButton={false}
    >
      <View style={styles.modalContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {t("common.loading")}
            </Text>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder={t("settings.searchCurrencies")}
                value={searchText}
                onChangeText={setSearchText}
                leftIcon="search"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.noteContainer}>
              <Text
                style={[
                  styles.noteText,
                  {
                    color: isDark
                      ? theme.colors.warning[300]
                      : theme.colors.warning[700],
                    backgroundColor: isDark
                      ? theme.colors.warning[900]
                      : theme.colors.warning[50],
                  },
                ]}
              >
                {t("settings.currencyNoteMessage")}
              </Text>
            </View>

            <FlatList
              data={filteredCurrencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              style={styles.currencyList}
            />
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  noteContainer: {
    marginBottom: spacing.md,
  },
  noteText: {
    padding: spacing.sm,
    borderRadius: radius.md,
    fontSize: fontSize.sm,
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
    width: 24,
    textAlign: "center",
  },
  currencyNameContainer: {
    flex: 1,
  },
  currencyCode: {
    fontSize: fontSize.md,
  },
  currencyName: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  exchangeRate: {
    fontSize: fontSize.xs,
    marginTop: 4,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
});
