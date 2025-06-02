/**
 * CurrencyModal component
 * Modal for selecting app currency with forex conversion
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common/context/ThemeContext";
import { useCurrency } from "@common/hooks/useCurrency";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ExchangeRates {
  [key: string]: number;
}

const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
];

export default function CurrencyModal({
  visible,
  onClose,
}: CurrencyModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(currency);

  // Fetch exchange rates from a free API
  const fetchExchangeRates = async () => {
    setLoading(true);
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
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchExchangeRates();
    }
  }, [visible]);

  const handleCurrencySelect = async (currencyCode: string) => {
    try {
      // Update currency in context (which also saves to AsyncStorage)
      await setCurrency(currencyCode);

      // Update local state
      setCurrentCurrency(currencyCode);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error("Failed to change currency:", error);
    }
  };

  const getExchangeRateDisplay = (currencyCode: string) => {
    if (!exchangeRates[currencyCode] || currencyCode === "USD") {
      return "";
    }

    const rate = exchangeRates[currencyCode];
    return `1 USD = ${rate.toFixed(2)} ${currencyCode}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
            },
          ]}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isDark
                      ? theme.colors.gray[100]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {t("account.currency")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100],
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={
                    isDark ? theme.colors.gray[300] : theme.colors.gray[600]
                  }
                />
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary[500]}
                />
                <Text
                  style={[
                    styles.loadingText,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t(
                    "common.loadingExchangeRates",
                    "Loading exchange rates..."
                  )}
                </Text>
              </View>
            )}

            <ScrollView style={styles.currencyList}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyItem,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.white,
                      borderColor: isDark
                        ? theme.colors.gray[700]
                        : theme.colors.gray[200],
                    },
                  ]}
                  onPress={() => handleCurrencySelect(curr.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.flag}>{curr.flag}</Text>
                    <View style={styles.currencyText}>
                      <Text
                        style={[
                          styles.currencyName,
                          {
                            color: isDark
                              ? theme.colors.gray[100]
                              : theme.colors.gray[900],
                          },
                        ]}
                      >
                        {curr.name} ({curr.symbol})
                      </Text>
                      <Text
                        style={[
                          styles.currencyCode,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {curr.code}
                        {getExchangeRateDisplay(curr.code) && (
                          <Text style={styles.exchangeRate}>
                            {" • "}
                            {getExchangeRateDisplay(curr.code)}
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  {currentCurrency === curr.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary[500]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
  },
  container: {
    maxHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  currencyList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
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
  currencyText: {
    flex: 1,
  },
  currencyName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.xs / 2,
  },
  currencyCode: {
    fontSize: fontSize.sm,
  },
  exchangeRate: {
    fontSize: fontSize.xs,
    fontStyle: "italic",
  },
});
