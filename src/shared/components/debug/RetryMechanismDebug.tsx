/**
 * Retry Mechanism Debug Component
 *
 * Provides debugging interface for the request retry mechanism:
 * - Queue statistics and monitoring
 * - Manual retry testing
 * - Configuration management
 * - Performance metrics
 *
 * @module @shared/components/debug/RetryMechanismDebug
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNetwork } from "@core/context/NetworkContext";
import {
  getRetryQueueStats,
  clearRetryQueue,
  addToRetryQueue,
  updateRetryConfig,
  isNetworkError,
} from "@core/utils/network/retry-handler";
// Colors defined inline since @core/design/colors is not available
const colors = {
  primary: "#007AFF",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  secondary: "#6c757d",
  background: "#f8f9fa",
  text: "#333333",
  textSecondary: "#666666",
  error: "#dc3545",
  info: "#17a2b8",
  surface: "#ffffff",
  white: "#ffffff",
};
import api from "@core/api/client";

interface RetryStats {
  queueSize: number;
  isProcessing: boolean;
  requests: Array<{
    id: string;
    retryCount: number;
    timestamp: number;
    maxRetries: number;
  }>;
}

export const RetryMechanismDebug: React.FC = () => {
  const { isConnected, isInternetReachable, retryFailedRequests } =
    useNetwork();
  const [stats, setStats] = useState<RetryStats>({
    queueSize: 0,
    isProcessing: false,
    requests: [],
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Update stats
  const updateStats = () => {
    const currentStats = getRetryQueueStats();
    setStats(currentStats);
  };

  // Auto-refresh stats
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(updateStats, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial stats load
  useEffect(() => {
    updateStats();
  }, []);

  // Test network error simulation
  const simulateNetworkError = async () => {
    try {
      const testRequest = async () => {
        // Simulate a network request that will fail
        throw new Error("Network Error - Simulated");
      };

      const requestId = addToRetryQueue(
        testRequest,
        new Error("Network Error - Simulated"),
        {
          maxRetries: 2,
          baseDelay: 2000,
          exponentialBackoff: true,
        }
      );

      setTestResults((prev) => [
        ...prev,
        `✅ Simulated network error added to queue (ID: ${requestId})`,
      ]);

      updateStats();
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        `❌ Failed to simulate network error: ${error}`,
      ]);
    }
  };

  // Test successful request
  const simulateSuccessfulRequest = async () => {
    try {
      const testRequest = async () => {
        // Simulate a successful request
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true };
      };

      const requestId = addToRetryQueue(testRequest, null, {
        maxRetries: 1,
        baseDelay: 1000,
      });

      setTestResults((prev) => [
        ...prev,
        `✅ Simulated successful request added to queue (ID: ${requestId})`,
      ]);

      updateStats();
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        `❌ Failed to simulate successful request: ${error}`,
      ]);
    }
  };

  // Test real API call that might fail
  const testRealApiCall = async () => {
    try {
      // Make a call to a non-existent endpoint to trigger network error handling
      await api.get("/non-existent-endpoint-for-testing");
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        `✅ Real API call failed as expected: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);

      // Check if it was added to retry queue
      setTimeout(() => {
        updateStats();
        const newStats = getRetryQueueStats();
        if (newStats.queueSize > stats.queueSize) {
          setTestResults((prev) => [
            ...prev,
            `✅ Failed API call was automatically added to retry queue`,
          ]);
        }
      }, 100);
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
  };

  // Clear retry queue
  const handleClearQueue = () => {
    Alert.alert(
      "Clear Retry Queue",
      "Are you sure you want to clear all queued requests?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearRetryQueue();
            updateStats();
            setTestResults((prev) => [...prev, `✅ Retry queue cleared`]);
          },
        },
      ]
    );
  };

  // Update retry configuration
  const updateConfig = (config: any) => {
    updateRetryConfig(config);
    setTestResults((prev) => [...prev, `✅ Retry configuration updated`]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔄 Request Retry Mechanism Debug</Text>

      {/* Network Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Network Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Connected:</Text>
          <Text
            style={[
              styles.value,
              { color: isConnected ? colors.success : colors.error },
            ]}
          >
            {isConnected ? "✅ Yes" : "❌ No"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Internet Reachable:</Text>
          <Text
            style={[
              styles.value,
              { color: isInternetReachable ? colors.success : colors.error },
            ]}
          >
            {isInternetReachable ? "✅ Yes" : "❌ No"}
          </Text>
        </View>
      </View>

      {/* Queue Statistics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Queue Statistics</Text>
          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={updateStats}
          >
            <Text style={styles.buttonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Queue Size:</Text>
          <Text
            style={[
              styles.value,
              { color: stats.queueSize > 0 ? colors.warning : colors.success },
            ]}
          >
            {stats.queueSize}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Processing:</Text>
          <Text
            style={[
              styles.value,
              { color: stats.isProcessing ? colors.info : colors.text },
            ]}
          >
            {stats.isProcessing ? "⏳ Yes" : "✅ No"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: autoRefresh ? colors.warning : colors.primary },
          ]}
          onPress={() => setAutoRefresh(!autoRefresh)}
        >
          <Text style={styles.buttonText}>
            {autoRefresh ? "⏸️ Stop Auto-refresh" : "▶️ Start Auto-refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queued Requests */}
      {stats.requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Queued Requests</Text>
          {stats.requests.map((request, index) => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requestId}>ID: {request.id}</Text>
              <Text style={styles.requestInfo}>
                Retry: {request.retryCount}/{request.maxRetries}
              </Text>
              <Text style={styles.requestInfo}>
                Age: {Math.round((Date.now() - request.timestamp) / 1000)}s
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Actions</Text>

        <TouchableOpacity style={styles.button} onPress={retryFailedRequests}>
          <Text style={styles.buttonText}>🔄 Manual Retry Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearQueue}
          disabled={stats.queueSize === 0}
        >
          <Text style={styles.buttonText}>
            🗑️ Clear Queue ({stats.queueSize})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Testing</Text>

        <TouchableOpacity style={styles.button} onPress={simulateNetworkError}>
          <Text style={styles.buttonText}>⚡ Simulate Network Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={simulateSuccessfulRequest}
        >
          <Text style={styles.buttonText}>✅ Simulate Success</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRealApiCall}>
          <Text style={styles.buttonText}>🌐 Test Real API Call</Text>
        </TouchableOpacity>
      </View>

      {/* Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuration</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => updateConfig({ maxRetries: 5, baseDelay: 2000 })}
        >
          <Text style={styles.buttonText}>📈 Increase Retries (5)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => updateConfig({ maxRetries: 2, baseDelay: 1000 })}
        >
          <Text style={styles.buttonText}>📉 Decrease Retries (2)</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Test Results</Text>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearTestResults}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>

          {testResults.slice(-10).map((result, index) => (
            <Text key={index} style={styles.testResult}>
              {result}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: colors.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 0,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  clearButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 0,
  },
  buttonText: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "500",
  },
  requestItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  requestId: {
    fontSize: 12,
    fontFamily: "monospace",
    color: colors.textSecondary,
  },
  requestInfo: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  testResult: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
});
