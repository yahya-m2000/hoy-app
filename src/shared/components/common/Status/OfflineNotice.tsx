// React
import React from "react";

// React Native
import { StyleSheet } from "react-native";

// Context
import { useNetwork } from "@shared/context";
import { useTheme } from "@shared/hooks/useTheme";

// Base components
import { Container } from "../../base/Container";
import { Text } from "../../base/Text";

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
    <Container
      style={{
        ...styles.container,
        backgroundColor: isDark
          ? theme.colors.error[800]
          : theme.colors.error[500],
      }}
      padding="sm"
    >
      <Text
        variant="body"
        weight="medium"
        color={theme.colors.white}
        style={styles.text}
      >
        You&apos;re offline. Some features may be unavailable.
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
});

export default OfflineNotice;
