/**
 * Certificate Pinning Debug Component
 *
 * Provides a comprehensive debugging interface for certificate pinning functionality.
 *
 * @module @shared/components/debug/CertificatePinningDebug
 * @author Hoy Development Team
 * @version 1.0.0 - Initial Implementation
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import {
  getCertificatePinningStats,
  validateCertificate,
  clearCertificateCache,
  CertificateValidationResult,
} from "@core/security/certificate-pinning";
import { getCertificatePinningInterceptorStats } from "@core/api/certificate-pinning-interceptor";

// ========================================
// INTERFACES
// ========================================

interface ValidationTest {
  id: string;
  url: string;
  timestamp: number;
  result: CertificateValidationResult;
}

// ========================================
// COMPONENT
// ========================================

export const CertificatePinningDebug: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [interceptorStats, setInterceptorStats] = useState<any>(null);
  const [testUrl, setTestUrl] = useState("https://api.hoy.com/health");
  const [validationHistory, setValidationHistory] = useState<ValidationTest[]>(
    []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // HANDLERS
  // ========================================

  const loadStats = async () => {
    try {
      const certStats = getCertificatePinningStats();
      const intStats = getCertificatePinningInterceptorStats();
      setStats(certStats);
      setInterceptorStats(intStats);
    } catch (error) {
      console.error("Error loading certificate pinning stats:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  const testCertificateValidation = async () => {
    if (!testUrl.trim()) {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCertificate(testUrl);

      const test: ValidationTest = {
        id: Date.now().toString(),
        url: testUrl,
        timestamp: Date.now(),
        result,
      };

      setValidationHistory((prev) => [test, ...prev.slice(0, 9)]);

      Alert.alert(
        result.isValid ? "Validation Passed" : "Validation Failed",
        `Domain: ${result.domain}\nMethod: ${result.validationMethod}\nTime: ${
          result.metadata.validationTime
        }ms${result.error ? `\nError: ${result.error}` : ""}`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert("Error", `Certificate validation failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const clearCache = () => {
    Alert.alert(
      "Clear Certificate Cache",
      "This will clear all cached certificate validation results. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCertificateCache();
            setValidationHistory([]);
            loadStats();
            Alert.alert("Success", "Certificate cache cleared");
          },
        },
      ]
    );
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderStatCard = (
    title: string,
    value: any,
    color: string = "#007AFF"
  ) => (
    <View key={title} style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>
        {typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value)}
      </Text>
    </View>
  );

  const renderValidationResult = (test: ValidationTest) => (
    <View
      key={test.id}
      style={[
        styles.resultCard,
        { borderLeftColor: test.result.isValid ? "#28a745" : "#dc3545" },
      ]}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultUrl} numberOfLines={1}>
          {test.url}
        </Text>
        <Text style={styles.resultTime}>
          {new Date(test.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.resultDetails}>
        <Text
          style={[
            styles.resultStatus,
            { color: test.result.isValid ? "#28a745" : "#dc3545" },
          ]}
        >
          {test.result.isValid ? "✓ VALID" : "✗ INVALID"}
        </Text>
        <Text style={styles.resultMethod}>
          Method: {test.result.validationMethod}
        </Text>
        <Text style={styles.resultDuration}>
          Duration: {test.result.metadata.validationTime}ms
        </Text>
      </View>

      {test.result.error && (
        <Text style={styles.resultError}>Error: {test.result.error}</Text>
      )}

      {test.result.warnings.length > 0 && (
        <Text style={styles.resultWarnings}>
          Warnings: {test.result.warnings.join(", ")}
        </Text>
      )}
    </View>
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>Certificate Pinning Debug</Text>

      {/* Certificate Pinning Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certificate Pinning Statistics</Text>
        {stats && (
          <>
            {renderStatCard("Total Domains", stats.totalDomains, "#007AFF")}
            {renderStatCard("Cache Size", stats.validationCacheSize, "#28a745")}
            {renderStatCard(
              "Failed Domains",
              stats.failedDomains?.length || 0,
              "#dc3545"
            )}
            {renderStatCard(
              "Configuration",
              `Enabled: ${stats.config?.enabled}, Strict: ${stats.config?.strictMode}`,
              "#6f42c1"
            )}
          </>
        )}
      </View>

      {/* Interceptor Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interceptor Statistics</Text>
        {interceptorStats && (
          <>
            {renderStatCard(
              "Total Validations",
              interceptorStats.totalValidations,
              "#007AFF"
            )}
            {renderStatCard(
              "Successful",
              interceptorStats.successfulValidations,
              "#28a745"
            )}
            {renderStatCard(
              "Failed",
              interceptorStats.failedValidations,
              "#dc3545"
            )}
            {renderStatCard(
              "Blocked Requests",
              interceptorStats.blockedRequests,
              "#fd7e14"
            )}
          </>
        )}
      </View>

      {/* Testing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certificate Validation Testing</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={testUrl}
            onChangeText={setTestUrl}
            placeholder="Enter URL to test (e.g., https://api.hoy.com)"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testCertificateValidation}
          disabled={isValidating}
        >
          <Text style={styles.buttonText}>
            {isValidating ? "Validating..." : "Test URL"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearCache}
        >
          <Text style={styles.buttonText}>Clear Certificate Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Validation History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Validation History</Text>
        {validationHistory.length === 0 ? (
          <Text style={styles.emptyText}>
            No validation tests performed yet
          </Text>
        ) : (
          validationHistory.map(renderValidationResult)
        )}
      </View>
    </ScrollView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "monospace",
  },
  inputContainer: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212529",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultUrl: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    flex: 1,
    marginRight: 8,
  },
  resultTime: {
    fontSize: 12,
    color: "#6c757d",
  },
  resultDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultMethod: {
    fontSize: 12,
    color: "#6c757d",
  },
  resultDuration: {
    fontSize: 12,
    color: "#6c757d",
  },
  resultError: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 4,
    fontStyle: "italic",
  },
  resultWarnings: {
    fontSize: 12,
    color: "#fd7e14",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
});
