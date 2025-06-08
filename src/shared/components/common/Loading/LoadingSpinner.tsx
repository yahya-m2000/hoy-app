/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

// React
import React from "react";

// React Native
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Context
import { useTheme } from "@shared/context";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingSpinner;
