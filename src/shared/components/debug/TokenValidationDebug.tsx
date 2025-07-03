/**
 * Token Validation Debug Component
 *
 * Debug and monitor the offline token validation system with cached expiry times
 * Shows performance improvements and validation methods
 *
 * @module @shared/components/debug/TokenValidationDebug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  validateToken,
  isTokenExpired,
  isTokenExpiredSync,
  getTokenExpirationTime,
  getTokenExpirationTimeSync,
  getAuthPerformanceStats,
  refreshTokenCache,
  initializeAuthManager,
  debugTokenRefreshFlow,
} from "@core/api/auth-manager";
import {
  getCacheStats,
  clearTokenCache,
  type TokenValidationResult,
} from "@core/api/token-cache";
import {
  getTokenFromStorage,
  getRefreshTokenFromStorage,
} from "@core/auth/storage";
import { logger } from "@core/utils/sys/log";

// ========================================
// TYPES & INTERFACES
// ========================================

interface PerformanceTest {
  testName: string;
  method: "sync" | "cached" | "decode";
  duration: number;
  result: boolean | number | null;
  timestamp: number;
}

interface ValidationStats {
  cacheHitRate: number;
  averageCachedTime: number;
  averageDecodeTime: number;
  performanceGain: number;
  totalValidations: number;
}

// ========================================
// MAIN COMPONENT
// ========================================

export const TokenValidationDebug: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<any>({});
  const [performanceStats, setPerformanceStats] = useState<any>({});
  const [validationResults, setValidationResults] = useState<
    TokenValidationResult[]
  >([]);
  const [performanceTests, setPerformanceTests] = useState<PerformanceTest[]>(
    []
  );
  const [validationStats, setValidationStats] =
    useState<ValidationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchStats = async () => {
    try {
      const [cache, performance] = await Promise.all([
        getCacheStats(),
        getAuthPerformanceStats(),
      ]);

      setCacheStats(cache);
      setPerformanceStats(performance);
    } catch (error) {
      logger.error("Failed to fetch token validation stats", error, {
        module: "TokenValidationDebug",
      });
    }
  };

  const runValidationTests = async () => {
    setIsLoading(true);
    const tests: PerformanceTest[] = [];

    try {
      const [accessToken, refreshToken] = await Promise.all([
        getTokenFromStorage(),
        getRefreshTokenFromStorage(),
      ]);

      if (accessToken) {
        // Test 1: Sync validation (legacy)
        const syncStart = performance.now();
        const syncResult = isTokenExpiredSync(accessToken);
        const syncDuration = performance.now() - syncStart;

        tests.push({
          testName: "Sync Validation (Legacy)",
          method: "sync",
          duration: syncDuration,
          result: syncResult,
          timestamp: Date.now(),
        });

        // Test 2: Cached validation
        const cachedStart = performance.now();
        const cachedResult = await isTokenExpired(accessToken, "access", true);
        const cachedDuration = performance.now() - cachedStart;

        tests.push({
          testName: "Cached Validation (Fast)",
          method: "cached",
          duration: cachedDuration,
          result: cachedResult,
          timestamp: Date.now(),
        });

        // Test 3: Force decode validation
        const decodeStart = performance.now();
        const decodeResult = await isTokenExpired(accessToken, "access", false);
        const decodeDuration = performance.now() - decodeStart;

        tests.push({
          testName: "Force Decode Validation",
          method: "decode",
          duration: decodeDuration,
          result: decodeResult,
          timestamp: Date.now(),
        });

        // Test 4: Detailed validation
        const detailedStart = performance.now();
        const detailedResult = await validateToken(accessToken, "access");
        const detailedDuration = performance.now() - detailedStart;

        tests.push({
          testName: "Detailed Validation",
          method: detailedResult.method as any,
          duration: detailedDuration,
          result: detailedResult.isValid,
          timestamp: Date.now(),
        });

        setValidationResults([detailedResult]);
      }

      setPerformanceTests(tests);

      // Calculate validation statistics
      if (tests.length >= 3) {
        const cachedTest = tests.find((t) => t.method === "cached");
        const decodeTest = tests.find((t) => t.method === "decode");

        if (cachedTest && decodeTest) {
          const performanceGain =
            ((decodeTest.duration - cachedTest.duration) /
              decodeTest.duration) *
            100;

          setValidationStats({
            cacheHitRate: cacheStats.accessTokenCached ? 100 : 0,
            averageCachedTime: cachedTest.duration,
            averageDecodeTime: decodeTest.duration,
            performanceGain: Math.max(0, performanceGain),
            totalValidations: tests.length,
          });
        }
      }
    } catch (error) {
      logger.error("Failed to run validation tests", error, {
        module: "TokenValidationDebug",
      });
      Alert.alert("Error", "Failed to run validation tests");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // ACTIONS
  // ========================================

  const handleClearCache = async () => {
    try {
      await clearTokenCache();
      Alert.alert("Success", "Token cache cleared");
      await fetchStats();
    } catch (error) {
      Alert.alert("Error", "Failed to clear token cache");
    }
  };

  const handleRefreshCache = async () => {
    try {
      const success = await refreshTokenCache();
      Alert.alert(
        "Success",
        success ? "Token cache refreshed" : "No tokens to cache"
      );
      await fetchStats();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh token cache");
    }
  };

  const handleInitializeSystem = async () => {
    try {
      await initializeAuthManager();
      Alert.alert("Success", "Authentication system initialized");
      await fetchStats();
    } catch (error) {
      Alert.alert("Error", "Failed to initialize authentication system");
    }
  };

  const handleDebugTokenFlow = async () => {
    try {
      await debugTokenRefreshFlow();
      Alert.alert("Success", "Token flow debug completed (check logs)");
    } catch (error) {
      Alert.alert("Error", "Failed to debug token flow");
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderCacheStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Token Cache Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { width: "48%" as any }]}>
          <Text style={styles.statLabel}>Access Token Cached</Text>
          <Text
            style={[
              styles.statValue,
              cacheStats.accessTokenCached
                ? styles.successText
                : styles.errorText,
            ]}
          >
            {cacheStats.accessTokenCached ? "Yes" : "No"}
          </Text>
        </View>
        <View style={[styles.statItem, { width: "48%" as any }]}>
          <Text style={styles.statLabel}>Refresh Token Cached</Text>
          <Text
            style={[
              styles.statValue,
              cacheStats.refreshTokenCached
                ? styles.successText
                : styles.errorText,
            ]}
          >
            {cacheStats.refreshTokenCached ? "Yes" : "No"}
          </Text>
        </View>
        {cacheStats.accessTokenValid !== undefined && (
          <View style={[styles.statItem, { width: "48%" as any }]}>
            <Text style={styles.statLabel}>Access Token Valid</Text>
            <Text
              style={[
                styles.statValue,
                cacheStats.accessTokenValid
                  ? styles.successText
                  : styles.errorText,
              ]}
            >
              {cacheStats.accessTokenValid ? "Yes" : "No"}
            </Text>
          </View>
        )}
        {cacheStats.accessTokenExpiresIn !== undefined && (
          <View style={[styles.statItem, { width: "48%" as any }]}>
            <Text style={styles.statLabel}>Expires In</Text>
            <Text style={styles.statValue}>
              {cacheStats.accessTokenExpiresIn > 0
                ? `${Math.round(cacheStats.accessTokenExpiresIn / 60)} minutes`
                : "Expired"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPerformanceStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Auth Check Method</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  performanceStats.authCheckMethod === "cached"
                    ? "#10B981"
                    : "#F59E0B",
              },
            ]}
          >
            {performanceStats.authCheckMethod?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Has Valid Auth</Text>
          <Text
            style={[
              styles.statValue,
              { color: performanceStats.hasValidAuth ? "#10B981" : "#EF4444" },
            ]}
          >
            {performanceStats.hasValidAuth ? "YES" : "NO"}
          </Text>
        </View>
        {performanceStats.performanceGain && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Performance Gain</Text>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {performanceStats.performanceGain}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderValidationTests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Validation Performance Tests</Text>
      {performanceTests.map((test, index) => (
        <View key={index} style={styles.testResult}>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>{test.testName}</Text>
            <Text
              style={[
                styles.testMethod,
                {
                  color:
                    test.method === "cached"
                      ? "#10B981"
                      : test.method === "sync"
                      ? "#F59E0B"
                      : "#EF4444",
                },
              ]}
            >
              {test.method.toUpperCase()}
            </Text>
          </View>
          <View style={styles.testDetails}>
            <Text style={styles.testDetail}>
              Duration: {test.duration.toFixed(2)}ms
            </Text>
            <Text style={styles.testDetail}>
              Result:{" "}
              {typeof test.result === "boolean"
                ? test.result
                  ? "EXPIRED"
                  : "VALID"
                : test.result}
            </Text>
          </View>
        </View>
      ))}

      {validationStats && (
        <View style={styles.summaryStats}>
          <Text style={styles.summaryTitle}>Performance Summary</Text>
          <Text style={styles.summaryText}>
            Cached validation is {validationStats.performanceGain.toFixed(1)}%
            faster
          </Text>
          <Text style={styles.summaryText}>
            Average cached time: {validationStats.averageCachedTime.toFixed(2)}
            ms
          </Text>
          <Text style={styles.summaryText}>
            Average decode time: {validationStats.averageDecodeTime.toFixed(2)}
            ms
          </Text>
        </View>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={runValidationTests}
          disabled={isLoading}
        >
          <Ionicons name="speedometer-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Run Performance Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefreshCache}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Refresh Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearCache}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleInitializeSystem}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Initialize System</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDebugTokenFlow}
        >
          <Ionicons name="bug-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Debug Token Flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, autoRefresh && styles.activeButton]}
          onPress={() => setAutoRefresh(!autoRefresh)}
        >
          <Ionicons
            name={autoRefresh ? "pause-outline" : "play-outline"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {autoRefresh ? "Stop Auto Refresh" : "Start Auto Refresh"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
        <Text style={styles.title}>Token Validation Debug</Text>
        <Text style={styles.subtitle}>
          Offline validation with cached expiry times
        </Text>
      </View>

      {renderCacheStats()}
      {renderPerformanceStats()}
      {renderValidationTests()}
      {renderActions()}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Issue #10 - NO OFFLINE TOKEN VALIDATION (MEDIUM) - RESOLVED ✅
        </Text>
        <Text style={styles.footerSubtext}>
          Cached token expiry eliminates JWT decoding overhead
        </Text>
      </View>
    </ScrollView>
  );
};

// ========================================
// STYLES
// ========================================

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center" as const,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1F2937",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  successText: {
    color: "#10B981",
  },
  errorText: {
    color: "#EF4444",
  },
  testResult: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
    flex: 1,
  },
  testMethod: {
    fontSize: 12,
    fontWeight: "600" as const,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  testDetails: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  testDetail: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryStats: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#3B82F6",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: "#1E40AF",
    marginBottom: 4,
  },
  actionGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: "48%" as any,
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  activeButton: {
    backgroundColor: "#10B981",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  footer: {
    alignItems: "center" as const,
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10B981",
    textAlign: "center" as const,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
    marginTop: 4,
  },
};

export default TokenValidationDebug;
