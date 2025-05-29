import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetwork } from "../context/NetworkContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Component that shows an offline banner when the device loses network connectivity
 */
const OfflineNotice: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetwork();
  const { theme, isDark } = useTheme();

  // Don't render anything if we're connected
  if (isConnected && isInternetReachable !== false) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.error[800]
            : theme.colors.error[500],
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.white }]}>
        You&apos;re offline. Some features may be unavailable.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OfflineNotice;
