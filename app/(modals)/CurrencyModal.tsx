/**
 * Currency Selection Modal for the Hoy application
 * Allows users to change their preferred currency
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
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import BottomSheetModal from "../../src/components/BottomSheetModal";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useCurrency } from "../../src/hooks/useCurrency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "../../src/components/TextInput";

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

// List of popular currencies
const popularCurrencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "CHF", name: "Swiss Franc", symbol: "₣" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
];

export default function CurrencyModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(currency || "USD");
  const [searchText, setSearchText] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState(popularCurrencies);

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
                ? theme.colors.primary[900]
                : theme.colors.primary[50]
              : "transparent",
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
        },
      ]}
      onPress={() => handleCurrencyChange(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text
          style={[
            styles.currencySymbol,
            {
              color:
                selectedCurrency === item.code
                  ? theme.colors.primary[500]
                  : isDark
                  ? theme.colors.gray[400]
                  : theme.colors.gray[600],
            },
          ]}
        >
          {item.symbol}
        </Text>
        <View style={styles.currencyNameContainer}>
          <Text
            style={[
              styles.currencyCode,
              {
                color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
                fontWeight: selectedCurrency === item.code ? "600" : "500",
              },
            ]}
          >
            {item.code}
          </Text>
          <Text
            style={[
              styles.currencyName,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {item.name}
          </Text>
        </View>
      </View>
      {selectedCurrency === item.code && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.primary[500]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      title={t("settings.selectCurrency")}
      showSaveButton={false}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
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
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
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
  currencySymbol: {
    fontSize: fontSize.lg,
    marginRight: spacing.md,
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
