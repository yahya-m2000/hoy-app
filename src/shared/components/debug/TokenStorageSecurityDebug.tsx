/**
 * Token Storage Security Debug Component
 *
 * Comprehensive debugging interface for token storage security including:
 * - Real-time token security monitoring
 * - Device binding validation testing
 * - Token encryption/decryption testing
 * - Storage migration testing
 * - Token rotation testing
 * - Performance metrics display
 *
 * Features:
 * - Interactive security testing
 * - Storage statistics dashboard
 * - Token validation interface
 * - Migration testing tools
 * - Performance monitoring
 * - Security audit trails
 *
 * @module @shared/components/debug/TokenStorageSecurityDebug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { logger } from "@core/utils/sys/log";
import {
  secureTokenStorage,
  getTokenStorageStats,
  migrateTokensToSecureStorage,
  rotateTokenSecurity,
  validateTokenSecurity,
  updateSecureStorageConfig,
  getRecentStorageOperations,
  type TokenStorageStats,
  type TokenMigrationResult,
  // type TokenRotationResult, // Not available
  // type TokenValidationResult, // Not available
  type TokenStorageOperation,
} from "@core/auth/secure-token-storage";

// Temporary type definitions for missing types
interface TokenRotationResult {
  success: boolean;
  newTokenId?: string;
  error?: string;
  timestamp: number;
}

interface TokenValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  securityScore: number;
}
import {
  getTokenEncryptionStats,
  tokenEncryptionManager,
} from "@core/security/token-encryption";

// ========================================
// TYPES AND INTERFACES
// ========================================

interface TokenSecurityTestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: string;
  timestamp: number;
}

interface SecurityAuditResult {
  deviceBinding: boolean;
  encryption: boolean;
  integrity: boolean;
  rotation: boolean;
  migration: boolean;
  overallScore: number;
  recommendations: string[];
}

// ========================================
// MAIN COMPONENT
// ========================================

export const TokenStorageSecurityDebug: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<
    "overview" | "testing" | "migration" | "audit"
  >("overview");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [storageStats, setStorageStats] = useState<TokenStorageStats | null>(
    null
  );
  const [encryptionStats, setEncryptionStats] = useState<any>(null);
  const [recentOperations, setRecentOperations] = useState<
    TokenStorageOperation[]
  >([]);
  const [testResults, setTestResults] = useState<TokenSecurityTestResult[]>([]);
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(
    null
  );

  // ========================================
  // DATA LOADING
  // ========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [stats, encStats, operations] = await Promise.all([
        getTokenStorageStats(),
        getTokenEncryptionStats(),
        Promise.resolve(getRecentStorageOperations()),
      ]);

      setStorageStats(stats);
      setEncryptionStats(encStats);
      setRecentOperations(operations);

      // Perform security audit
      await performSecurityAudit();
    } catch (error) {
      logger.error("[TokenStorageDebug] Failed to load data:", error, {
        module: "TokenStorageDebug",
      });
      Alert.alert("Error", "Failed to load token storage data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================
  // SECURITY TESTING FUNCTIONS
  // ========================================

  const runSecurityTest = async (
    testName: string,
    testFunction: () => Promise<any>
  ) => {
    const startTime = Date.now();

    try {
      setLoading(true);
      const result = await testFunction();
      const duration = Date.now() - startTime;

      const testResult: TokenSecurityTestResult = {
        testName,
        success: true,
        duration,
        details: JSON.stringify(result, null, 2),
        timestamp: Date.now(),
      };

      setTestResults((prev) => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
      Alert.alert(
        "Test Completed",
        `${testName} completed successfully in ${duration}ms`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TokenSecurityTestResult = {
        testName,
        success: false,
        duration,
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      setTestResults((prev) => [testResult, ...prev.slice(0, 9)]);
      Alert.alert(
        "Test Failed",
        `${testName} failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testTokenEncryption = async () => {
    const testToken = "test_token_" + Date.now();
    const encrypted = await tokenEncryptionManager.encryptToken(
      testToken,
      "access"
    );
    const decrypted = await tokenEncryptionManager.decryptToken(
      encrypted,
      "access"
    );

    if (decrypted !== testToken) {
      throw new Error("Token encryption/decryption mismatch");
    }

    return {
      original: testToken,
      encrypted: encrypted.encryptedToken,
      decrypted,
    };
  };

  const testDeviceBinding = async () => {
    const validation = await validateTokenSecurity();
    return {
      accessTokenDeviceMatch: validation.accessToken.deviceMatch,
      refreshTokenDeviceMatch: validation.refreshToken.deviceMatch,
      overall:
        validation.accessToken.deviceMatch &&
        validation.refreshToken.deviceMatch,
    };
  };

  const testTokenRotation = async () => {
    return await rotateTokenSecurity();
  };

  const testStorageMigration = async () => {
    return await migrateTokensToSecureStorage();
  };

  const testTokenValidation = async () => {
    return await validateTokenSecurity();
  };

  // ========================================
  // SECURITY AUDIT
  // ========================================

  const performSecurityAudit = async () => {
    try {
      const [storageStats, encryptionStats, validation] = await Promise.all([
        getTokenStorageStats(),
        getTokenEncryptionStats(),
        validateTokenSecurity(),
      ]);

      const audit: SecurityAuditResult = {
        deviceBinding:
          storageStats.deviceBindingActive &&
          validation.accessToken.deviceMatch,
        encryption:
          storageStats.encryptionActive && encryptionStats.encryptionEnabled,
        integrity:
          validation.accessToken.integrityValid &&
          validation.refreshToken.integrityValid,
        rotation:
          storageStats.rotationCount > 0 && encryptionStats.rotationCount > 0,
        migration: storageStats.migrationCount > 0,
        overallScore: 0,
        recommendations: [],
      };

      // Calculate overall score
      const checks = [
        audit.deviceBinding,
        audit.encryption,
        audit.integrity,
        audit.rotation,
        audit.migration,
      ];
      audit.overallScore =
        (checks.filter(Boolean).length / checks.length) * 100;

      // Generate recommendations
      if (!audit.deviceBinding) {
        audit.recommendations.push(
          "Enable device binding for enhanced security"
        );
      }
      if (!audit.encryption) {
        audit.recommendations.push("Enable token encryption");
      }
      if (!audit.integrity) {
        audit.recommendations.push("Fix token integrity validation issues");
      }
      if (!audit.rotation) {
        audit.recommendations.push("Implement regular token rotation");
      }
      if (!audit.migration) {
        audit.recommendations.push("Complete migration to secure storage");
      }

      setAuditResult(audit);
    } catch (error) {
      logger.error("[TokenStorageDebug] Security audit failed:", error, {
        module: "TokenStorageDebug",
      });
    }
  };

  // ========================================
  // CONFIGURATION FUNCTIONS
  // ========================================

  const toggleEncryption = () => {
    updateSecureStorageConfig({
      encryptionEnabled: !storageStats?.encryptionActive,
    });
    Alert.alert(
      "Configuration Updated",
      "Token encryption setting has been toggled"
    );
    setTimeout(loadData, 1000);
  };

  const toggleDeviceBinding = () => {
    updateSecureStorageConfig({
      deviceBindingEnabled: !storageStats?.deviceBindingActive,
    });
    Alert.alert(
      "Configuration Updated",
      "Device binding setting has been toggled"
    );
    setTimeout(loadData, 1000);
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Storage Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Statistics</Text>
        {storageStats && (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Encrypted Tokens</Text>
              <Text style={styles.statValue}>
                {storageStats.encryptedTokensCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Basic Tokens</Text>
              <Text style={styles.statValue}>
                {storageStats.basicTokensCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Migration Count</Text>
              <Text style={styles.statValue}>
                {storageStats.migrationCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Validation Failures</Text>
              <Text style={styles.statValue}>
                {storageStats.validationFailures}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rotation Count</Text>
              <Text style={styles.statValue}>{storageStats.rotationCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Retrieval Time</Text>
              <Text style={styles.statValue}>
                {storageStats.averageRetrievalTime.toFixed(2)}ms
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Security Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Status</Text>
        {storageStats && (
          <View style={styles.statusGrid}>
            <View
              style={[
                styles.statusItem,
                storageStats.encryptionActive
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <Text style={styles.statusLabel}>Encryption</Text>
              <Text style={styles.statusValue}>
                {storageStats.encryptionActive ? "ON" : "OFF"}
              </Text>
            </View>
            <View
              style={[
                styles.statusItem,
                storageStats.deviceBindingActive
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <Text style={styles.statusLabel}>Device Binding</Text>
              <Text style={styles.statusValue}>
                {storageStats.deviceBindingActive ? "ON" : "OFF"}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Recent Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Operations ({recentOperations.length})
        </Text>
        {recentOperations.slice(0, 5).map((operation, index) => (
          <View key={index} style={styles.operationItem}>
            <View style={styles.operationHeader}>
              <Text style={styles.operationType}>
                {operation.operation.toUpperCase()}
              </Text>
              <Text style={styles.operationToken}>{operation.tokenType}</Text>
              <Text
                style={[
                  styles.operationStatus,
                  operation.success ? styles.successText : styles.errorText,
                ]}
              >
                {operation.success ? "SUCCESS" : "FAILED"}
              </Text>
            </View>
            <Text style={styles.operationTime}>
              {operation.duration}ms -{" "}
              {new Date(operation.timestamp).toLocaleTimeString()}
            </Text>
            {operation.error && (
              <Text style={styles.operationError}>{operation.error}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTestingTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Tests</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runSecurityTest("Token Encryption", testTokenEncryption)
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Encryption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runSecurityTest("Device Binding", testDeviceBinding)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Device Binding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runSecurityTest("Token Validation", testTokenValidation)
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Validation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runSecurityTest("Token Rotation", testTokenRotation)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Rotation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuration Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.configGrid}>
          <TouchableOpacity
            style={[
              styles.configButton,
              storageStats?.encryptionActive
                ? styles.configActive
                : styles.configInactive,
            ]}
            onPress={toggleEncryption}
          >
            <Text style={styles.configButtonText}>
              Encryption: {storageStats?.encryptionActive ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.configButton,
              storageStats?.deviceBindingActive
                ? styles.configActive
                : styles.configInactive,
            ]}
            onPress={toggleDeviceBinding}
          >
            <Text style={styles.configButtonText}>
              Device Binding: {storageStats?.deviceBindingActive ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Test Results ({testResults.length})
        </Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.testResultItem}>
            <View style={styles.testResultHeader}>
              <Text style={styles.testResultName}>{result.testName}</Text>
              <Text
                style={[
                  styles.testResultStatus,
                  result.success ? styles.successText : styles.errorText,
                ]}
              >
                {result.success ? "PASS" : "FAIL"}
              </Text>
            </View>
            <Text style={styles.testResultTime}>
              {result.duration}ms -{" "}
              {new Date(result.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.testResultDetails} numberOfLines={3}>
              {result.details}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMigrationTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Migration</Text>

        <TouchableOpacity
          style={styles.migrationButton}
          onPress={() =>
            runSecurityTest("Storage Migration", testStorageMigration)
          }
          disabled={loading}
        >
          <Text style={styles.migrationButtonText}>Run Migration Test</Text>
        </TouchableOpacity>

        {storageStats && (
          <View style={styles.migrationStats}>
            <Text style={styles.migrationStatText}>
              Migration Count: {storageStats.migrationCount}
            </Text>
            <Text style={styles.migrationStatText}>
              Encrypted Tokens: {storageStats.encryptedTokensCount}
            </Text>
            <Text style={styles.migrationStatText}>
              Basic Tokens: {storageStats.basicTokensCount}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderAuditTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Audit</Text>

        <TouchableOpacity
          style={styles.auditButton}
          onPress={performSecurityAudit}
          disabled={loading}
        >
          <Text style={styles.auditButtonText}>Run Security Audit</Text>
        </TouchableOpacity>

        {auditResult && (
          <View style={styles.auditResults}>
            <View style={styles.auditScore}>
              <Text style={styles.auditScoreText}>
                Overall Score: {auditResult.overallScore.toFixed(0)}%
              </Text>
            </View>

            <View style={styles.auditChecks}>
              <View
                style={[
                  styles.auditCheck,
                  auditResult.deviceBinding
                    ? styles.auditPass
                    : styles.auditFail,
                ]}
              >
                <Text style={styles.auditCheckText}>
                  Device Binding: {auditResult.deviceBinding ? "PASS" : "FAIL"}
                </Text>
              </View>
              <View
                style={[
                  styles.auditCheck,
                  auditResult.encryption ? styles.auditPass : styles.auditFail,
                ]}
              >
                <Text style={styles.auditCheckText}>
                  Encryption: {auditResult.encryption ? "PASS" : "FAIL"}
                </Text>
              </View>
              <View
                style={[
                  styles.auditCheck,
                  auditResult.integrity ? styles.auditPass : styles.auditFail,
                ]}
              >
                <Text style={styles.auditCheckText}>
                  Integrity: {auditResult.integrity ? "PASS" : "FAIL"}
                </Text>
              </View>
              <View
                style={[
                  styles.auditCheck,
                  auditResult.rotation ? styles.auditPass : styles.auditFail,
                ]}
              >
                <Text style={styles.auditCheckText}>
                  Rotation: {auditResult.rotation ? "PASS" : "FAIL"}
                </Text>
              </View>
              <View
                style={[
                  styles.auditCheck,
                  auditResult.migration ? styles.auditPass : styles.auditFail,
                ]}
              >
                <Text style={styles.auditCheckText}>
                  Migration: {auditResult.migration ? "PASS" : "FAIL"}
                </Text>
              </View>
            </View>

            {auditResult.recommendations.length > 0 && (
              <View style={styles.auditRecommendations}>
                <Text style={styles.auditRecommendationsTitle}>
                  Recommendations:
                </Text>
                {auditResult.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.auditRecommendationText}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Token Storage Security Debug</Text>
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {(["overview", "testing", "migration", "audit"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "testing" && renderTestingTab()}
        {activeTab === "migration" && renderMigrationTab()}
        {activeTab === "audit" && renderAuditTab()}
      </View>

      {/* Refresh Control */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        <Text style={styles.refreshButtonText}>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusItem: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statusActive: {
    backgroundColor: "#e8f5e8",
  },
  statusInactive: {
    backgroundColor: "#ffe8e8",
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  operationItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
  },
  operationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  operationType: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007AFF",
  },
  operationToken: {
    fontSize: 12,
    color: "#666",
  },
  operationStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  operationTime: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  operationError: {
    fontSize: 11,
    color: "#ff4444",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  testButton: {
    width: "48%",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  configGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  configButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: "center",
  },
  configActive: {
    backgroundColor: "#28a745",
  },
  configInactive: {
    backgroundColor: "#dc3545",
  },
  configButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  testResultItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
  },
  testResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  testResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  testResultStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  testResultTime: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  testResultDetails: {
    fontSize: 11,
    color: "#666",
    fontFamily: "monospace",
  },
  migrationButton: {
    backgroundColor: "#17a2b8",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  migrationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  migrationStats: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
  },
  migrationStatText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  auditButton: {
    backgroundColor: "#6f42c1",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  auditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  auditResults: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
  },
  auditScore: {
    alignItems: "center",
    marginBottom: 16,
  },
  auditScoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  auditChecks: {
    marginBottom: 16,
  },
  auditCheck: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  auditPass: {
    backgroundColor: "#d4edda",
  },
  auditFail: {
    backgroundColor: "#f8d7da",
  },
  auditCheckText: {
    fontSize: 14,
    fontWeight: "600",
  },
  auditRecommendations: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 6,
  },
  auditRecommendationsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 8,
  },
  auditRecommendationText: {
    fontSize: 13,
    color: "#856404",
    marginBottom: 4,
  },
  refreshButton: {
    backgroundColor: "#28a745",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successText: {
    color: "#28a745",
  },
  errorText: {
    color: "#dc3545",
  },
});

export default TokenStorageSecurityDebug;
