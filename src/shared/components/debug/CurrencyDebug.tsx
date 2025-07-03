/**
 * Currency Debug Component
 * For testing and monitoring the production currency service
 *
 * @module @shared/components/debug/CurrencyDebug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useCurrency } from "@core/context";
import { currencyService, ApiUsageStats } from "@core/external/currency";
import { logger } from "@core/utils/sys/log";

interface ConversionTest {
  id: string;
  amount: number;
  from: string;
  to: string;
  result?: number;
  error?: string;
  timestamp: Date;
  source: "sync" | "async";
}

export const CurrencyDebug: React.FC = () => {
  const { currency } = useCurrency();

  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [conversionTests, setConversionTests] = useState<ConversionTest[]>([]);
  const [testInProgress, setTestInProgress] = useState(false);
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadApiStats();
    loadExchangeRates();
    loadSupportedCurrencies();
  }, []);

  const loadApiStats = () => {
    try {
      const stats = currencyService.getApiUsageStats();
      setApiStats(stats);
    } catch (error) {
      logger.error("Failed to load API stats", error);
    }
  };

  const loadSupportedCurrencies = async () => {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      setSupportedCurrencies(currencies.map((c) => c.code));
    } catch (error) {
      logger.error("Failed to load supported currencies", error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const rates = await currencyService.getExchangeRates("USD");
      setExchangeRates(rates);
    } catch (error) {
      logger.error("Failed to load exchange rates", error);
    }
  };

  const runConversionTest = async () => {
    if (testInProgress) return;

    setTestInProgress(true);
    setIsLoading(true);
    const testCases = [
      { amount: 100, from: "USD", to: "EUR" },
      { amount: 50, from: "EUR", to: "GBP" },
      { amount: 1000, from: "USD", to: "JPY" },
      { amount: 200, from: "GBP", to: "CAD" },
    ];

    const newTests: ConversionTest[] = [];

    for (const testCase of testCases) {
      // Test sync conversion (using cached rates)
      try {
        const rates = await currencyService.getExchangeRates(testCase.from);
        const syncResult = testCase.amount * (rates[testCase.to] || 1);
        newTests.push({
          id: `sync-${Date.now()}-${Math.random()}`,
          ...testCase,
          result: syncResult,
          timestamp: new Date(),
          source: "sync",
        });
      } catch (error) {
        newTests.push({
          id: `sync-error-${Date.now()}-${Math.random()}`,
          ...testCase,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
          source: "sync",
        });
      }

      // Test async conversion (real API)
      try {
        const asyncResult = await currencyService.convertCurrency(
          testCase.amount,
          testCase.from,
          testCase.to
        );
        newTests.push({
          id: `async-${Date.now()}-${Math.random()}`,
          ...testCase,
          result: asyncResult,
          timestamp: new Date(),
          source: "async",
        });
      } catch (error) {
        newTests.push({
          id: `async-error-${Date.now()}-${Math.random()}`,
          ...testCase,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
          source: "async",
        });
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setConversionTests((prev) => [...newTests, ...prev].slice(0, 20)); // Keep last 20 tests
    setTestInProgress(false);
    setIsLoading(false);
    setLastUpdateTime(new Date());
    loadApiStats(); // Refresh stats after tests
  };

  const handleClearCache = async () => {
    try {
      await currencyService.clearCache();
      Alert.alert("Success", "Currency cache cleared successfully");
      loadApiStats();
      loadExchangeRates();
    } catch (error) {
      Alert.alert("Error", "Failed to clear cache");
      logger.error("Failed to clear cache", error);
    }
  };

  const handleRefreshRates = async () => {
    try {
      setIsLoading(true);
      await loadExchangeRates();
      setLastUpdateTime(new Date());
      Alert.alert("Success", "Exchange rates refreshed successfully");
      loadApiStats();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh rates");
      logger.error("Failed to refresh rates", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Currency Service Debug</Text>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text style={styles.info}>Current Currency: {currency}</Text>
        <Text style={styles.info}>
          Supported Currencies: {supportedCurrencies.length}
        </Text>
        <Text style={styles.info}>Loading: {isLoading ? "Yes" : "No"}</Text>
        <Text style={styles.info}>
          Last Update:{" "}
          {lastUpdateTime ? lastUpdateTime.toLocaleString() : "Never"}
        </Text>
      </View>

      {/* API Usage Stats */}
      {apiStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Usage Statistics</Text>
          <Text style={styles.info}>
            Primary API Calls: {apiStats.primaryApiCalls}
          </Text>
          <Text style={styles.info}>
            Fallback API Calls: {apiStats.fallbackApiCalls}
          </Text>
          <Text style={styles.info}>
            Monthly Limit: {apiStats.monthlyLimit}
          </Text>
          <Text style={styles.info}>
            Last Reset: {new Date(apiStats.lastReset).toLocaleDateString()}
          </Text>
          <Text
            style={[
              styles.info,
              apiStats.primaryApiCalls > apiStats.monthlyLimit * 0.8 &&
                styles.warning,
            ]}
          >
            Usage:{" "}
            {Math.round(
              (apiStats.primaryApiCalls / apiStats.monthlyLimit) * 100
            )}
            %
          </Text>
        </View>
      )}

      {/* Exchange Rates Sample */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Current Exchange Rates (USD Base)
        </Text>
        {Object.entries(exchangeRates)
          .slice(0, 8)
          .map(([code, rate]) => (
            <Text key={code} style={styles.info}>
              {code}: {rate.toFixed(4)}
            </Text>
          ))}
        {Object.keys(exchangeRates).length > 8 && (
          <Text style={styles.info}>
            ... and {Object.keys(exchangeRates).length - 8} more
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={[styles.button, testInProgress && styles.buttonDisabled]}
          onPress={runConversionTest}
          disabled={testInProgress}
        >
          <Text style={styles.buttonText}>
            {testInProgress ? "Running Tests..." : "Run Conversion Tests"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRefreshRates}>
          <Text style={styles.buttonText}>Refresh Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={loadApiStats}>
          <Text style={styles.buttonText}>Reload Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Conversion Test Results */}
      {conversionTests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Conversion Tests</Text>
          {conversionTests.map((test) => (
            <View key={test.id} style={styles.testResult}>
              <Text style={styles.testHeader}>
                {test.amount} {test.from} → {test.to} ({test.source})
              </Text>
              {test.result !== undefined ? (
                <Text style={styles.testSuccess}>
                  Result: {test.result} {test.to}
                </Text>
              ) : (
                <Text style={styles.testError}>Error: {test.error}</Text>
              )}
              <Text style={styles.testTime}>
                {test.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Format Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Format Examples</Text>
        <Text style={styles.info}>
          {currencyService.formatAmount(1234.56, "USD")}
        </Text>
        <Text style={styles.info}>
          {currencyService.formatAmount(1234.56, "EUR")}
        </Text>
        <Text style={styles.info}>
          {currencyService.formatAmount(1234.56, "GBP")}
        </Text>
        <Text style={styles.info}>
          {currencyService.formatAmount(1234.56, "JPY")}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  warning: {
    color: "#ff6b35",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  testResult: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  testHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  testSuccess: {
    fontSize: 14,
    color: "#28a745",
    marginBottom: 2,
  },
  testError: {
    fontSize: 14,
    color: "#dc3545",
    marginBottom: 2,
  },
  testTime: {
    fontSize: 12,
    color: "#999",
  },
});

export default CurrencyDebug;
