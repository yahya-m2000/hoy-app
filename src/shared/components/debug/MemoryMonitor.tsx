/**
 * Memory Monitor Component
 * Development tool for monitoring memory leaks
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Container } from "@shared/components/layout/Container";
import { Icon } from "@shared/components/base/Icon";
import { useTheme } from "@core/hooks/useTheme";
import { spacing, radius } from "@core/design";
import colors from "@core/design/colors";
import {
  getMemoryStats,
  resetMemoryTracking,
} from "@core/utils/sys/memory-detector";

interface MemoryMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

export const MemoryMonitor: React.FC<MemoryMonitorProps> = ({
  visible = true,
  onClose,
}) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    timers: 0,
    listeners: 0,
    networkListeners: 0,
    total: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const updateStats = () => {
      const currentStats = getMemoryStats();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleReset = () => {
    resetMemoryTracking();
    setStats({ timers: 0, listeners: 0, networkListeners: 0, total: 0 });
  };

  const getRiskColor = (total: number): string => {
    if (total > 100) return "#ff4444"; // error red
    if (total > 50) return "#ffaa00"; // warning orange
    return "#44ff44"; // success green
  };

  if (!visible || !__DEV__) return null;

  const riskColor = getRiskColor(stats.total);

  return (
    <Container
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Container style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Memory Monitor
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </Container>

      <Container style={styles.content}>
        <Container style={styles.statsRow}>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
            Timers: {stats.timers}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
            Listeners: {stats.listeners}
          </Text>
        </Container>

        <Container style={styles.statsRow}>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
            Network: {stats.networkListeners}
          </Text>
          <Text style={[styles.totalLabel, { color: riskColor }]}>
            Total: {stats.total}
          </Text>
        </Container>

        <Container style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isMonitoring ? "#ff4444" : "#44ff44" },
            ]}
            onPress={() => setIsMonitoring(!isMonitoring)}
          >
            <Text style={styles.buttonText}>
              {isMonitoring ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ffaa00" }]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </Container>
      </Container>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: spacing.md,
    width: 250,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default MemoryMonitor;
