/**
 * Error Monitor Dashboard (Simplified)
 *
 * Development-only component for monitoring and debugging errors in real-time.
 * Uses only basic React Native components for maximum compatibility.
 *
 * @module @shared/components/debug/ErrorMonitor
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
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";

import {
  errorReportingService,
  ErrorMetrics,
  ErrorReport,
  ErrorType,
  ErrorLevel,
} from "src/core/api/services/error/error-reporting.service";
import { eventEmitter } from "@core/utils/sys/event-emitter";
import { logger } from "@core/utils/sys/log";

// ========================================
// TYPES & INTERFACES
// ========================================

interface ErrorMonitorProps {
  visible: boolean;
  onClose: () => void;
}

// ========================================
// ERROR MONITOR COMPONENT
// ========================================

export const ErrorMonitor: React.FC<ErrorMonitorProps> = ({
  visible,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * Load error data
   */
  const loadErrorData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Load metrics and errors in parallel
      const [metricsData, errorsData] = await Promise.all([
        errorReportingService.getErrorMetrics(),
        errorReportingService.exportErrors(),
      ]);

      setMetrics(metricsData);
      setErrors(errorsData.slice(-50)); // Show last 50 errors

      logger.info("[ErrorMonitor] Error data loaded", {
        totalErrors: metricsData.totalErrors,
        sessionErrors: metricsData.sessionErrors,
        module: "ErrorMonitor",
      });
    } catch (error) {
      logger.error("[ErrorMonitor] Failed to load error data:", error);
      Alert.alert("Error", "Failed to load error data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Set up real-time error listening
   */
  useEffect(() => {
    if (!visible) return;

    // Initial load
    loadErrorData();

    // Listen for new errors
    const handleNewError = (errorReport: ErrorReport) => {
      setErrors((prev) => [errorReport, ...prev.slice(0, 49)]);

      // Update metrics (simplified)
      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              totalErrors: prev.totalErrors + 1,
              sessionErrors: prev.sessionErrors + 1,
            }
          : null
      );
    };

    eventEmitter.on("error:reported", handleNewError);

    // Auto-refresh interval
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(loadErrorData, 10000); // Refresh every 10 seconds
    }

    return () => {
      eventEmitter.off("error:reported", handleNewError);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [visible, autoRefresh, loadErrorData]);

  /**
   * Clear all errors
   */
  const handleClearErrors = useCallback(() => {
    Alert.alert(
      "Clear All Errors",
      "This will permanently delete all stored error data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await errorReportingService.clearErrors();
              await loadErrorData();
              Alert.alert("Success", "All errors have been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear errors");
            }
          },
        },
      ]
    );
  }, [loadErrorData]);

  /**
   * Export error data
   */
  const handleExportErrors = useCallback(async () => {
    try {
      const allErrors = await errorReportingService.exportErrors();
      const exportData = {
        timestamp: new Date().toISOString(),
        metrics,
        errors: allErrors,
        serviceStatus: errorReportingService.getStatus(),
      };

      // In a real app, this would save to file or share
      console.log("Error Export Data:", JSON.stringify(exportData, null, 2));
      Alert.alert("Export Complete", "Error data has been logged to console");
    } catch (error) {
      Alert.alert("Export Failed", "Failed to export error data");
    }
  }, [metrics]);

  /**
   * Get error level color
   */
  const getErrorLevelColor = useCallback((level: ErrorLevel): string => {
    switch (level) {
      case ErrorLevel.FATAL:
        return "#ff1744";
      case ErrorLevel.ERROR:
        return "#f44336";
      case ErrorLevel.WARNING:
        return "#ff9800";
      case ErrorLevel.INFO:
        return "#2196f3";
      default:
        return "#666666";
    }
  }, []);

  /**
   * Render error list item
   */
  const renderErrorItem = useCallback(
    ({ item }: { item: ErrorReport }) => {
      const timeAgo = Math.floor((Date.now() - item.timestamp) / 1000 / 60);

      return (
        <TouchableOpacity
          style={styles.errorItem}
          onPress={() => {
            setSelectedError(item);
            setShowDetails(true);
          }}
        >
          <View style={styles.errorHeader}>
            <View
              style={[
                styles.errorIndicator,
                { backgroundColor: getErrorLevelColor(item.level) },
              ]}
            />
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>
                {item.level.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.errorTime}>
              {timeAgo < 1 ? "Just now" : `${timeAgo}m ago`}
            </Text>
          </View>

          <Text style={styles.errorMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.errorTags}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.errorTag}>
                  <Text style={styles.errorTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [getErrorLevelColor]
  );

  /**
   * Render error details modal
   */
  const renderErrorDetails = () => {
    if (!selectedError) return null;

    return (
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Error Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Error ID</Text>
              <Text style={styles.detailValue}>{selectedError.id}</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Message</Text>
              <Text style={styles.detailValue}>{selectedError.message}</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Type & Level</Text>
              <View style={styles.detailRow}>
                <View style={styles.errorBadge}>
                  <Text style={styles.errorBadgeText}>
                    {selectedError.type}
                  </Text>
                </View>
                <View
                  style={[
                    styles.errorBadge,
                    {
                      backgroundColor: getErrorLevelColor(selectedError.level),
                    },
                  ]}
                >
                  <Text style={styles.errorBadgeText}>
                    {selectedError.level}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Timestamp</Text>
              <Text style={styles.detailValue}>
                {new Date(selectedError.timestamp).toLocaleString()}
              </Text>
            </View>

            {selectedError.stack && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Stack Trace</Text>
                <ScrollView style={styles.stackContainer} horizontal>
                  <Text style={styles.stackTrace}>{selectedError.stack}</Text>
                </ScrollView>
              </View>
            )}

            {selectedError.context && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Context</Text>
                <Text style={styles.detailValue}>
                  {JSON.stringify(selectedError.context, null, 2)}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (!visible || !__DEV__) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>🚨 Error Monitor</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                autoRefresh && styles.refreshButtonActive,
              ]}
              onPress={() => setAutoRefresh(!autoRefresh)}
            >
              <Text style={styles.refreshButtonText}>
                {autoRefresh ? "⏸️" : "▶️"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadErrorData} />
          }
        >
          {/* Metrics Overview */}
          {metrics && (
            <View style={styles.metricsCard}>
              <Text style={styles.sectionTitle}>Error Metrics</Text>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{metrics.totalErrors}</Text>
                  <Text style={styles.metricLabel}>Total Errors</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {metrics.sessionErrors}
                  </Text>
                  <Text style={styles.metricLabel}>Session Errors</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {metrics.errorRate.toFixed(2)}
                  </Text>
                  <Text style={styles.metricLabel}>Errors/Min</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, styles.crashRate]}>
                    {(metrics.crashRate * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.metricLabel}>Crash Rate</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Errors */}
          <View style={styles.errorsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Errors</Text>
              <Text style={styles.errorCount}>({errors.length})</Text>
            </View>

            {errors.length > 0 ? (
              <FlatList
                data={errors}
                keyExtractor={(item) => item.id}
                renderItem={renderErrorItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.noErrors}>
                <Text style={styles.noErrorsText}>✅ No errors detected</Text>
                <Text style={styles.noErrorsSubtext}>
                  Your app is running smoothly!
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleExportErrors}
              >
                <Text style={styles.actionButtonText}>Export Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleClearErrors}
              >
                <Text
                  style={[styles.actionButtonText, styles.dangerButtonText]}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Error Details Modal */}
        {renderErrorDetails()}
      </View>
    </Modal>
  );
};

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  refreshButtonActive: {
    backgroundColor: "#e3f2fd",
  },
  refreshButtonText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Metrics
  metricsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricItem: {
    width: "48%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  crashRate: {
    color: "#f44336",
  },

  // Errors List
  errorsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  errorCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  errorItem: {
    paddingVertical: 12,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  errorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  errorBadge: {
    backgroundColor: "#666",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  errorBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  errorTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: "auto",
  },
  errorMessage: {
    fontSize: 14,
    color: "#333",
    marginVertical: 4,
    lineHeight: 20,
  },
  errorTags: {
    flexDirection: "row",
    marginTop: 4,
  },
  errorTag: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  errorTagText: {
    fontSize: 10,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
  noErrors: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noErrorsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4caf50",
    marginBottom: 4,
  },
  noErrorsSubtext: {
    fontSize: 14,
    color: "#666",
  },

  // Actions
  actionsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  dangerButtonText: {
    color: "white",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
  },
  stackContainer: {
    maxHeight: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 8,
  },
  stackTrace: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
  },
});

// ========================================
// EXPORTS
// ========================================

export default ErrorMonitor;
