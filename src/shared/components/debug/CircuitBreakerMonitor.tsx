/**
 * Circuit Breaker Monitor Component
 * Debug component for monitoring circuit breaker health and metrics
 * Only available in development builds
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getAllCircuitBreakerMetrics,
  getCircuitBreakerHealth,
  resetCircuitBreaker,
  resetAllCircuitBreakers,
  CircuitBreakerState,
  type CircuitBreakerMetrics,
} from "@core/api/circuit-breaker";
import { eventEmitter, AppEvents } from "@core/utils/sys/event-emitter";
import { logger } from "@core/utils/sys/log";
import { useTheme } from "@core/hooks";

interface CircuitBreakerMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

export const CircuitBreakerMonitor: React.FC<CircuitBreakerMonitorProps> = ({
  visible = true,
  onClose,
}) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<
    Array<CircuitBreakerMetrics & { endpoint: string }>
  >([]);
  const [health, setHealth] = useState<{
    healthy: number;
    degraded: number;
    failed: number;
    total: number;
    healthScore: number;
  }>({ healthy: 0, degraded: 0, failed: 0, total: 0, healthScore: 100 });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      const currentMetrics = getAllCircuitBreakerMetrics();
      const currentHealth = getCircuitBreakerHealth();

      setMetrics(currentMetrics);
      setHealth(currentHealth);
      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Failed to refresh circuit breaker data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for circuit breaker events
  useEffect(() => {
    const unsubscribers = [
      eventEmitter.on(AppEvents.CIRCUIT_BREAKER_OPENED, refreshData),
      eventEmitter.on(AppEvents.CIRCUIT_BREAKER_CLOSED, refreshData),
      eventEmitter.on(AppEvents.CIRCUIT_BREAKER_HALF_OPEN, refreshData),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  // Reset specific circuit breaker
  const handleResetCircuitBreaker = (endpoint: string) => {
    Alert.alert(
      "Reset Circuit Breaker",
      `Are you sure you want to reset the circuit breaker for ${endpoint}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetCircuitBreaker(endpoint);
            refreshData();
          },
        },
      ]
    );
  };

  // Reset all circuit breakers
  const handleResetAll = () => {
    Alert.alert(
      "Reset All Circuit Breakers",
      "Are you sure you want to reset all circuit breakers?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset All",
          style: "destructive",
          onPress: () => {
            resetAllCircuitBreakers();
            refreshData();
          },
        },
      ]
    );
  };

  // Get state color
  const getStateColor = (state: CircuitBreakerState): string => {
    switch (state) {
      case CircuitBreakerState.CLOSED:
        return "#22c55e"; // green
      case CircuitBreakerState.HALF_OPEN:
        return "#f59e0b"; // amber
      case CircuitBreakerState.OPEN:
        return "#ef4444"; // red
      default:
        return theme.colors.primary; // gray
    }
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  if (!visible || !__DEV__) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 100,
        left: 10,
        right: 10,
        bottom: 100,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderRadius: 12,
        padding: 16,
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#374151",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Circuit Breaker Monitor
        </Text>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#374151",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 14 }}>Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Health Summary */}
      <View
        style={{
          backgroundColor: "#1f2937",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Health Summary
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#22c55e" }}>Healthy: {health.healthy}</Text>
          <Text style={{ color: "#f59e0b" }}>Degraded: {health.degraded}</Text>
          <Text style={{ color: "#ef4444" }}>Failed: {health.failed}</Text>
        </View>
        <Text
          style={{
            color: "#ffffff",
            marginTop: 4,
            fontSize: 14,
          }}
        >
          Health Score: {health.healthScore}%
        </Text>
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Last Update: {lastUpdate.toLocaleTimeString()}
        </Text>
      </View>

      {/* Controls */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 16,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={refreshData}
          disabled={refreshing}
          style={{
            backgroundColor: "#3b82f6",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 14 }}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleResetAll}
          style={{
            backgroundColor: "#ef4444",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 14 }}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor="#ffffff"
          />
        }
      >
        {metrics.length === 0 ? (
          <Text
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No circuit breakers active
          </Text>
        ) : (
          metrics.map((metric, index) => (
            <View
              key={`${metric.endpoint}-${index}`}
              style={{
                backgroundColor: "#1f2937",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: getStateColor(metric.state),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                    flex: 1,
                  }}
                >
                  {metric.endpoint}
                </Text>
                <View
                  style={{
                    backgroundColor: getStateColor(metric.state),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {metric.state}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Failures: {metric.failureCount}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Successes: {metric.successCount}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Consecutive: {metric.consecutiveFailures}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Total: {metric.totalRequests}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Blocked: {metric.blockedRequests}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Recovery: {metric.recoveryAttempts}
                </Text>
              </View>

              {metric.lastFailureTime > 0 && (
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Last Failure:{" "}
                  {formatDuration(Date.now() - metric.lastFailureTime)} ago
                </Text>
              )}

              <TouchableOpacity
                onPress={() => handleResetCircuitBreaker(metric.endpoint)}
                style={{
                  backgroundColor: "#374151",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                  marginTop: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 12 }}>Reset</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CircuitBreakerMonitor;
