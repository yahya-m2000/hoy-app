/**
 * Request Signing Debug Component
 * Simple debug component for monitoring request signing
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const RequestSigningDebug: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [secretCount, setSecretCount] = useState(1);
  const [nonceCount, setNonceCount] = useState(0);

  useEffect(() => {
    try {
      // Try to get signing health if available
      const { getSigningHealth } = require("@core/api/request-signing");
      const health = getSigningHealth();
      setIsEnabled(health.enabled);
      setSecretCount(health.secretCount);
      setNonceCount(health.nonceCount);
    } catch (error) {
      // Signing not available
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Request Signing</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text
          style={[styles.value, { color: isEnabled ? "#10B981" : "#EF4444" }]}
        >
          {isEnabled ? "ENABLED" : "DISABLED"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Secrets:</Text>
        <Text style={styles.value}>{secretCount}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Nonces:</Text>
        <Text style={styles.value}>{nonceCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default RequestSigningDebug;
