/**
 * API Key Management Debug Component
 *
 * Comprehensive debugging interface for API key management system.
 * Provides real-time monitoring, testing, and management capabilities.
 *
 * Features:
 * - Real-time key status monitoring
 * - Manual key operations (set, rotate, validate)
 * - Usage statistics and analytics
 * - Provider configuration display
 * - Key rotation history
 * - Performance metrics
 * - Interactive testing tools
 *
 * @module @shared/components/debug/ApiKeyManagementDebug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  StyleSheet,
} from "react-native";
import {
  apiKeyManager,
  getApiKey,
  setApiKey,
  rotateApiKey,
  validateApiKey,
  getApiKeyUsageStats,
  getApiProviders,
  getKeyValidationResults,
  ApiProvider,
  KeyUsageStats,
  KeyValidationResult,
  KeyRotationResult,
} from "@core/security/api-key-manager";
import {
  getApiKeyInterceptorStats,
  resetApiKeyInterceptorStats,
  ApiKeyInterceptorStats,
} from "@core/api/api-key-interceptor";

// ========================================
// TYPES
// ========================================

interface TabConfig {
  id: string;
  title: string;
  icon: string;
}

interface KeyTestResult {
  provider: string;
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: number;
}

// ========================================
// COMPONENT
// ========================================

export const ApiKeyManagementDebug: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [usageStats, setUsageStats] = useState<KeyUsageStats[]>([]);
  const [validationResults, setValidationResults] = useState<
    KeyValidationResult[]
  >([]);
  const [interceptorStats, setInterceptorStats] =
    useState<ApiKeyInterceptorStats | null>(null);
  const [testResults, setTestResults] = useState<KeyTestResult[]>([]);

  // Modal states
  const [showSetKeyModal, setShowSetKeyModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  // Form states
  const [newApiKey, setNewApiKey] = useState("");
  const [keyType, setKeyType] = useState<"primary" | "fallback">("primary");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Tab configuration
  const tabs: TabConfig[] = [
    { id: "overview", title: "Overview", icon: "📊" },
    { id: "providers", title: "Providers", icon: "🔧" },
    { id: "usage", title: "Usage Stats", icon: "📈" },
    { id: "validation", title: "Validation", icon: "✅" },
    { id: "testing", title: "Testing", icon: "🧪" },
    { id: "interceptor", title: "Interceptor", icon: "🔄" },
  ];

  // ========================================
  // LIFECYCLE
  // ========================================

  useEffect(() => {
    loadData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadData, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // ========================================
  // DATA LOADING
  // ========================================

  const loadData = async () => {
    try {
      const [providersData, usageData, validationData, interceptorData] =
        await Promise.all([
          getApiProviders(),
          getApiKeyUsageStats(),
          getKeyValidationResults(),
          getApiKeyInterceptorStats(),
        ]);

      setProviders(providersData);
      setUsageStats(usageData);
      setValidationResults(validationData);
      setInterceptorStats(interceptorData);
    } catch (error) {
      console.error("Failed to load API key debug data:", error);
    }
  };

  // ========================================
  // API KEY OPERATIONS
  // ========================================

  const handleSetApiKey = async () => {
    if (!selectedProvider || !newApiKey.trim()) {
      Alert.alert("Error", "Please select a provider and enter an API key");
      return;
    }

    try {
      await setApiKey(selectedProvider, newApiKey.trim(), keyType);
      Alert.alert("Success", `API key set for ${selectedProvider}`);
      setShowSetKeyModal(false);
      setNewApiKey("");
      setSelectedProvider("");
      loadData();
    } catch (error) {
      Alert.alert("Error", `Failed to set API key: ${error}`);
    }
  };

  const handleRotateKey = async (provider: string) => {
    try {
      const result: KeyRotationResult = await rotateApiKey(provider);

      if (result.success) {
        Alert.alert("Success", `API key rotated for ${provider}`);
      } else {
        Alert.alert("Error", `Key rotation failed: ${result.error}`);
      }

      loadData();
    } catch (error) {
      Alert.alert("Error", `Failed to rotate key: ${error}`);
    }
  };

  const handleValidateKey = async (provider: string) => {
    try {
      const result: KeyValidationResult = await validateApiKey(provider);

      Alert.alert(
        result.isValid ? "Valid" : "Invalid",
        `Key validation for ${provider}:\n` +
          `Status: ${result.isValid ? "Valid" : "Invalid"}\n` +
          `Response Time: ${result.responseTime}ms\n` +
          (result.errorMessage ? `Error: ${result.errorMessage}` : "")
      );

      loadData();
    } catch (error) {
      Alert.alert("Error", `Failed to validate key: ${error}`);
    }
  };

  const handleTestKey = async (provider: string) => {
    const startTime = Date.now();

    try {
      const key = await getApiKey(provider);
      const responseTime = Date.now() - startTime;

      const result: KeyTestResult = {
        provider,
        success: !!key,
        responseTime,
        error: key ? undefined : "No key available",
        timestamp: Date.now(),
      };

      setTestResults((prev) => [result, ...prev.slice(0, 9)]);

      Alert.alert(
        result.success ? "Success" : "Failed",
        `Key test for ${provider}:\n` +
          `Status: ${result.success ? "Available" : "Not Available"}\n` +
          `Response Time: ${responseTime}ms\n` +
          (result.error ? `Error: ${result.error}` : "")
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: KeyTestResult = {
        provider,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      setTestResults((prev) => [result, ...prev.slice(0, 9)]);
      Alert.alert("Error", `Key test failed: ${error}`);
    }
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderTabBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabBar}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 API Key Management Overview</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{providers.length}</Text>
          <Text style={styles.statLabel}>Providers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{usageStats.length}</Text>
          <Text style={styles.statLabel}>Active Keys</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Auto Refresh</Text>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoRefresh ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProviders = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔧 API Providers</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowSetKeyModal(true)}
      >
        <Text style={styles.addButtonText}>+ Set API Key</Text>
      </TouchableOpacity>

      {providers.map((provider) => (
        <View key={provider.name} style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <Text style={styles.providerName}>{provider.displayName}</Text>
            <Text style={styles.providerStatus}>
              {provider.rotationSupported ? "🔄 Rotation" : "🔒 Static"}
            </Text>
          </View>

          <Text style={styles.providerUrl}>{provider.baseUrl}</Text>
          <Text style={styles.providerAuth}>Auth: {provider.authMethod}</Text>

          <View style={styles.rateLimitInfo}>
            <Text style={styles.rateLimitText}>
              Rate Limits: {provider.rateLimit.requestsPerMinute}/min,{" "}
              {provider.rateLimit.requestsPerHour}/hr
            </Text>
          </View>

          <View style={styles.providerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTestKey(provider.name)}
            >
              <Text style={styles.actionButtonText}>Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleValidateKey(provider.name)}
            >
              <Text style={styles.actionButtonText}>Validate</Text>
            </TouchableOpacity>

            {provider.rotationSupported && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rotateButton]}
                onPress={() => handleRotateKey(provider.name)}
              >
                <Text style={styles.actionButtonText}>Rotate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderUsageStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📈 Usage Statistics</Text>

      {usageStats.map((stat) => (
        <View key={stat.keyId} style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statProvider}>{stat.provider}</Text>
            <Text style={styles.statKeyId}>
              {stat.keyId.substring(0, 12)}...
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Requests:</Text>
            <Text style={styles.statValue}>{stat.totalRequests}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Success Rate:</Text>
            <Text style={styles.statValue}>
              {stat.totalRequests > 0
                ? `${Math.round(
                    (stat.successfulRequests / stat.totalRequests) * 100
                  )}%`
                : "0%"}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Avg Response:</Text>
            <Text style={styles.statValue}>{stat.averageResponseTime}ms</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Used:</Text>
            <Text style={styles.statValue}>
              {stat.lastUsed
                ? new Date(stat.lastUsed).toLocaleTimeString()
                : "Never"}
            </Text>
          </View>
        </View>
      ))}

      {usageStats.length === 0 && (
        <Text style={styles.emptyText}>No usage statistics available</Text>
      )}
    </View>
  );

  const renderValidation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>✅ Key Validation Results</Text>

      {validationResults.map((result) => (
        <View
          key={`${result.provider}-${result.keyId}`}
          style={styles.validationCard}
        >
          <View style={styles.validationHeader}>
            <Text style={styles.validationProvider}>{result.provider}</Text>
            <Text
              style={[
                styles.validationStatus,
                result.isValid ? styles.validStatus : styles.invalidStatus,
              ]}
            >
              {result.isValid ? "✅ Valid" : "❌ Invalid"}
            </Text>
          </View>

          <Text style={styles.validationTime}>
            Response Time: {result.responseTime}ms
          </Text>

          {result.rateLimitRemaining && (
            <Text style={styles.validationRateLimit}>
              Rate Limit Remaining: {result.rateLimitRemaining}
            </Text>
          )}

          {result.errorMessage && (
            <Text style={styles.validationError}>
              Error: {result.errorMessage}
            </Text>
          )}

          <Text style={styles.validationTimestamp}>
            Validated: {new Date(result.validatedAt).toLocaleString()}
          </Text>
        </View>
      ))}

      {validationResults.length === 0 && (
        <Text style={styles.emptyText}>No validation results available</Text>
      )}
    </View>
  );

  const renderTesting = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🧪 Interactive Testing</Text>

      <View style={styles.testingControls}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => providers.forEach((p) => handleTestKey(p.name))}
        >
          <Text style={styles.testButtonText}>Test All Keys</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => setTestResults([])}
        >
          <Text style={styles.testButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subsectionTitle}>Recent Test Results</Text>

      {testResults.map((result, index) => (
        <View key={index} style={styles.testResultCard}>
          <View style={styles.testResultHeader}>
            <Text style={styles.testResultProvider}>{result.provider}</Text>
            <Text
              style={[
                styles.testResultStatus,
                result.success ? styles.testSuccess : styles.testFailure,
              ]}
            >
              {result.success ? "✅" : "❌"}
            </Text>
          </View>

          <Text style={styles.testResultTime}>
            Response Time: {result.responseTime}ms
          </Text>

          {result.error && (
            <Text style={styles.testResultError}>Error: {result.error}</Text>
          )}

          <Text style={styles.testResultTimestamp}>
            {new Date(result.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}

      {testResults.length === 0 && (
        <Text style={styles.emptyText}>No test results available</Text>
      )}
    </View>
  );

  const renderInterceptor = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔄 Interceptor Statistics</Text>

      {interceptorStats && (
        <>
          <View style={styles.interceptorStatsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {interceptorStats.totalRequests}
              </Text>
              <Text style={styles.statLabel}>Total Requests</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {interceptorStats.successfulInjections}
              </Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {interceptorStats.failedInjections}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {interceptorStats.fallbackUsage}
              </Text>
              <Text style={styles.statLabel}>Fallback Used</Text>
            </View>
          </View>

          <View style={styles.interceptorDetails}>
            <Text style={styles.detailRow}>
              Key Rotations: {interceptorStats.keyRotations}
            </Text>
            <Text style={styles.detailRow}>
              Avg Processing:{" "}
              {interceptorStats.averageProcessingTime.toFixed(2)}ms
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              resetApiKeyInterceptorStats();
              loadData();
            }}
          >
            <Text style={styles.resetButtonText}>Reset Statistics</Text>
          </TouchableOpacity>
        </>
      )}

      {!interceptorStats && (
        <Text style={styles.emptyText}>
          No interceptor statistics available
        </Text>
      )}
    </View>
  );

  const renderSetKeyModal = () => (
    <Modal
      visible={showSetKeyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSetKeyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set API Key</Text>

          <Text style={styles.inputLabel}>Provider:</Text>
          <View style={styles.pickerContainer}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.name}
                style={[
                  styles.providerOption,
                  selectedProvider === provider.name &&
                    styles.selectedProviderOption,
                ]}
                onPress={() => setSelectedProvider(provider.name)}
              >
                <Text
                  style={[
                    styles.providerOptionText,
                    selectedProvider === provider.name &&
                      styles.selectedProviderOptionText,
                  ]}
                >
                  {provider.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Key Type:</Text>
          <View style={styles.keyTypeContainer}>
            <TouchableOpacity
              style={[
                styles.keyTypeOption,
                keyType === "primary" && styles.selectedKeyTypeOption,
              ]}
              onPress={() => setKeyType("primary")}
            >
              <Text
                style={[
                  styles.keyTypeOptionText,
                  keyType === "primary" && styles.selectedKeyTypeOptionText,
                ]}
              >
                Primary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.keyTypeOption,
                keyType === "fallback" && styles.selectedKeyTypeOption,
              ]}
              onPress={() => setKeyType("fallback")}
            >
              <Text
                style={[
                  styles.keyTypeOptionText,
                  keyType === "fallback" && styles.selectedKeyTypeOptionText,
                ]}
              >
                Fallback
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>API Key:</Text>
          <TextInput
            style={styles.textInput}
            value={newApiKey}
            onChangeText={setNewApiKey}
            placeholder="Enter API key..."
            secureTextEntry={true}
            multiline={false}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSetKeyModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSetApiKey}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "providers":
        return renderProviders();
      case "usage":
        return renderUsageStats();
      case "validation":
        return renderValidation();
      case "testing":
        return renderTesting();
      case "interceptor":
        return renderInterceptor();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 API Key Management</Text>

      {renderTabBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {renderSetKeyModal()}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
    color: "#555",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  providerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  providerStatus: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  providerUrl: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  providerAuth: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  rateLimitInfo: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  rateLimitText: {
    fontSize: 11,
    color: "#666",
  },
  providerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  rotateButton: {
    backgroundColor: "#FF9500",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statProvider: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statKeyId: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  validationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  validationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  validationProvider: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  validationStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validStatus: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  invalidStatus: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  validationTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  validationRateLimit: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  validationError: {
    fontSize: 12,
    color: "#dc3545",
    marginBottom: 4,
  },
  validationTimestamp: {
    fontSize: 11,
    color: "#999",
  },
  testingControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  testResultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  testResultProvider: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  testResultStatus: {
    fontSize: 18,
  },
  testSuccess: {
    color: "#34C759",
  },
  testFailure: {
    color: "#FF3B30",
  },
  testResultTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  testResultError: {
    fontSize: 12,
    color: "#dc3545",
    marginBottom: 4,
  },
  testResultTimestamp: {
    fontSize: 11,
    color: "#999",
  },
  interceptorStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  interceptorDetails: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  detailRow: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  resetButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  providerOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  selectedProviderOption: {
    backgroundColor: "#007AFF",
  },
  providerOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedProviderOptionText: {
    color: "#fff",
  },
  keyTypeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  keyTypeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    alignItems: "center",
  },
  selectedKeyTypeOption: {
    backgroundColor: "#007AFF",
  },
  keyTypeOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedKeyTypeOptionText: {
    color: "#fff",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ApiKeyManagementDebug;
