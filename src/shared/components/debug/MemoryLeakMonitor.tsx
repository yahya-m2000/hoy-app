/**
 * Memory Leak Monitor Component
 * Development tool for monitoring memory leaks in real-time
 *
 * Features:
 * - Real-time memory statistics
 * - Event listener tracking
 * - Timer monitoring
 * - Memory leak alerts
 * - Performance metrics
 *
 * @module @shared/components/debug/MemoryLeakMonitor
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
import { Container } from "@shared/components/layout/Container";
import { Icon } from "@shared/components/base/Icon";
import { useTheme } from "@core/hooks/useTheme";
// Design tokens defined inline since @core/design is not available
const colors = {
  primary: "#007AFF",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  error: "#dc3545",
  info: "#17a2b8",
};
const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };
const radius = { sm: 4, md: 8, lg: 12 };
import {
  getMemoryStats,
  resetMemoryTracking,
} from "@core/utils/sys/memory-detector";
import { eventEmitter } from "@core/utils/sys/event-emitter";
import { logger } from "@core/utils/sys/log";

interface MemoryLeakMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

interface MemoryStats {
  timers: number;
  listeners: number;
  networkListeners: number;
  total: number;
}

interface PerformanceMetrics {
  memoryGrowth: number;
  avgResponseTime: number;
  gcCollections: number;
  lastGcTime: Date | null;
}

export const MemoryLeakMonitor: React.FC<MemoryLeakMonitorProps> = ({
  visible = true,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState<MemoryStats>({
    timers: 0,
    listeners: 0,
    networkListeners: 0,
    total: 0,
  });
  const [history, setHistory] = useState<MemoryStats[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [alertThreshold, setAlertThreshold] = useState(50);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    memoryGrowth: 0,
    avgResponseTime: 0,
    gcCollections: 0,
    lastGcTime: null,
  });

  // Update memory stats
  const updateStats = () => {
    try {
      const currentStats = getMemoryStats();
      setStats(currentStats);

      // Update history (keep last 20 entries)
      setHistory((prev) => {
        const newHistory = [...prev, currentStats].slice(-20);

        // Calculate memory growth
        if (newHistory.length > 1) {
          const growth =
            newHistory[newHistory.length - 1].total - newHistory[0].total;
          setPerformance((prev) => ({
            ...prev,
            memoryGrowth: growth,
          }));
        }

        return newHistory;
      });

      // Check for memory leaks
      if (currentStats.total > alertThreshold) {
        logger.warn("[MemoryLeakMonitor] High memory usage detected", {
          stats: currentStats,
          threshold: alertThreshold,
          module: "MemoryLeakMonitor",
        });

        if (__DEV__) {
          Alert.alert(
            "🚨 Memory Leak Alert",
            `High memory usage detected:\n\nTimers: ${currentStats.timers}\nListeners: ${currentStats.listeners}\nTotal: ${currentStats.total}\n\nThreshold: ${alertThreshold}`,
            [
              { text: "Ignore", style: "cancel" },
              { text: "Reset Tracking", onPress: handleResetTracking },
              { text: "Force Cleanup", onPress: handleForceCleanup },
            ]
          );
        }
      }
    } catch (error) {
      logger.error("[MemoryLeakMonitor] Error updating stats:", error);
    }
  };

  // Auto-refresh stats
  useEffect(() => {
    if (!isMonitoring) return;

    updateStats(); // Initial update
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, alertThreshold]);

  // Handle reset tracking
  const handleResetTracking = () => {
    try {
      resetMemoryTracking();
      setHistory([]);
      setStats({ timers: 0, listeners: 0, networkListeners: 0, total: 0 });
      logger.info("[MemoryLeakMonitor] Memory tracking reset");
    } catch (error) {
      logger.error("[MemoryLeakMonitor] Error resetting tracking:", error);
    }
  };

  // Handle force cleanup
  const handleForceCleanup = () => {
    try {
      // Emit cleanup event
      eventEmitter.emit("system:force_cleanup");

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        setPerformance((prev) => ({
          ...prev,
          gcCollections: prev.gcCollections + 1,
          lastGcTime: new Date(),
        }));
      }

      logger.info("[MemoryLeakMonitor] Force cleanup executed");
    } catch (error) {
      logger.error("[MemoryLeakMonitor] Error during force cleanup:", error);
    }
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    logger.info(
      `[MemoryLeakMonitor] Monitoring ${!isMonitoring ? "enabled" : "disabled"}`
    );
  };

  // Get risk level color
  const getRiskColor = (total: number): string => {
    if (total > alertThreshold * 2) return colors.error;
    if (total > alertThreshold) return colors.warning;
    if (total > alertThreshold * 0.7) return colors.info;
    return colors.success;
  };

  // Get trend indicator
  const getTrendIndicator = (): { icon: string; color: string } => {
    if (history.length < 2)
      return { icon: "remove", color: theme.text.secondary };

    const recent = history.slice(-3);
    const isIncreasing = recent.every(
      (stat, index) => index === 0 || stat.total >= recent[index - 1].total
    );
    const isDecreasing = recent.every(
      (stat, index) => index === 0 || stat.total <= recent[index - 1].total
    );

    if (isIncreasing) return { icon: "trending-up", color: colors.error };
    if (isDecreasing) return { icon: "trending-down", color: colors.success };
    return { icon: "remove", color: colors.info };
  };

  if (!visible || !__DEV__) return null;

  const trend = getTrendIndicator();
  const riskColor = getRiskColor(stats.total);

  return (
    <Container
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <Container style={styles.header}>
        <Container flexDirection="row" alignItems="center" flex={1}>
          <Icon name="analytics" size={20} color={theme.text.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Memory Leak Monitor
          </Text>
          <Text style={{ fontSize: 16, color: trend.color }}>{trend.icon}</Text>
        </Container>

        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </Container>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Indicator */}
        <Container
          style={[styles.statusCard, { backgroundColor: theme.surface }]}
        >
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text style={[styles.statusText, { color: theme.text.primary }]}>
              Status: {isMonitoring ? "Monitoring" : "Paused"}
            </Text>
            <Container flexDirection="row" alignItems="center">
              <View
                style={[styles.statusDot, { backgroundColor: riskColor }]}
              />
              <Text style={[styles.riskText, { color: riskColor }]}>
                {stats.total > alertThreshold * 2
                  ? "CRITICAL"
                  : stats.total > alertThreshold
                  ? "HIGH"
                  : stats.total > alertThreshold * 0.7
                  ? "MEDIUM"
                  : "LOW"}
              </Text>
            </Container>
          </Container>
        </Container>

        {/* Memory Statistics */}
        <Container style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Current Memory Usage
          </Text>

          <Container style={styles.statsGrid}>
            <Container style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {stats.timers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Timers
              </Text>
            </Container>

            <Container style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {stats.listeners}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Listeners
              </Text>
            </Container>

            <Container style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.networkListeners}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Network
              </Text>
            </Container>

            <Container style={styles.statItem}>
              <Text style={[styles.statValue, { color: riskColor }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Total
              </Text>
            </Container>
          </Container>
        </Container>

        {/* Performance Metrics */}
        <Container style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Performance Metrics
          </Text>

          <Container style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>
              Memory Growth:
            </Text>
            <Text
              style={[
                styles.metricValue,
                {
                  color:
                    performance.memoryGrowth > 10
                      ? colors.error
                      : colors.success,
                },
              ]}
            >
              {performance.memoryGrowth > 0 ? "+" : ""}
              {performance.memoryGrowth}
            </Text>
          </Container>

          <Container style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>
              GC Collections:
            </Text>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>
              {performance.gcCollections}
            </Text>
          </Container>

          {performance.lastGcTime && (
            <Container style={styles.metricRow}>
              <Text
                style={[styles.metricLabel, { color: theme.text.secondary }]}
              >
                Last GC:
              </Text>
              <Text style={[styles.metricValue, { color: theme.text.primary }]}>
                {performance.lastGcTime.toLocaleTimeString()}
              </Text>
            </Container>
          )}
        </Container>

        {/* History Chart (Simple) */}
        {history.length > 1 && (
          <Container style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              Memory Usage History
            </Text>

            <Container style={styles.chartContainer}>
              {history.slice(-10).map((stat, index) => (
                <Container key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(
                          4,
                          (stat.total /
                            Math.max(...history.map((h) => h.total))) *
                            40
                        ),
                        backgroundColor: getRiskColor(stat.total),
                      },
                    ]}
                  />
                  <Text
                    style={[styles.chartLabel, { color: theme.text.secondary }]}
                  >
                    {stat.total}
                  </Text>
                </Container>
              ))}
            </Container>
          </Container>
        )}

        {/* Controls */}
        <Container style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Controls
          </Text>

          <Container style={styles.controlsGrid}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: isMonitoring ? colors.error : colors.success,
                },
              ]}
              onPress={toggleMonitoring}
            >
              <Icon
                name={isMonitoring ? "pause" : "play"}
                size={16}
                color="white"
              />
              <Text style={styles.controlButtonText}>
                {isMonitoring ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.warning },
              ]}
              onPress={handleResetTracking}
            >
              <Icon name="refresh" size={16} color="white" />
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.info }]}
              onPress={handleForceCleanup}
            >
              <Icon name="trash" size={16} color="white" />
              <Text style={styles.controlButtonText}>Cleanup</Text>
            </TouchableOpacity>
          </Container>
        </Container>

        {/* Settings */}
        <Container style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Settings
          </Text>

          <Container style={styles.settingRow}>
            <Text
              style={[styles.settingLabel, { color: theme.text.secondary }]}
            >
              Refresh Interval: {refreshInterval / 1000}s
            </Text>
          </Container>

          <Container style={styles.settingRow}>
            <Text
              style={[styles.settingLabel, { color: theme.text.secondary }]}
            >
              Alert Threshold: {alertThreshold}
            </Text>
          </Container>
        </Container>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: spacing.md,
    width: 300,
    maxHeight: 600,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    maxHeight: 500,
  },
  statusCard: {
    margin: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  riskText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    margin: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 60,
    justifyContent: "space-between",
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  chartLabel: {
    fontSize: 10,
  },
  controlsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  controlButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  settingRow: {
    marginBottom: spacing.xs,
  },
  settingLabel: {
    fontSize: 12,
  },
});

export default MemoryLeakMonitor;
