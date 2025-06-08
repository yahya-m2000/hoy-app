/**
 * Reusable Custom Header Component
 * Provides consistent header design with centered title and left-aligned back button
 */

/**
 * Reusable Custom Header Component
 * Provides consistent header design with centered title and left-aligned back button
 */

// React
import React from "react";

// React Native
import { View, StyleSheet, Platform } from "react-native";

// Expo
import { StatusBar } from "expo-status-bar";

// Context
import { useTheme } from "@shared/context/ThemeContext";

// Constants
import { spacing } from "@shared/constants/spacing";

// Base components
import { Text } from "../../base/Text";

// Common components
import { BackButton } from "../Navigation/BackButton";

// Types
import { CustomHeaderProps } from "./Headers.types";

export default function CustomHeader({
  title,
  onBackPress,
  backgroundColor,
  textColor,
  showBackButton = true,
  style,
}: CustomHeaderProps) {
  const { theme, isDark } = useTheme();

  const headerBackgroundColor =
    backgroundColor ||
    (isDark ? theme.colors.grayPalette[900] : theme.colors.grayPalette[50]);

  const titleColor = textColor || (isDark ? theme.white : theme.black);

  const borderColor = isDark
    ? theme.colors.grayPalette[700]
    : theme.colors.grayPalette[300];

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            borderBottomColor: borderColor,
          },
          style,
        ]}
      >
        {/* Left side - Back Button */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <BackButton onPress={onBackPress} color={titleColor} />
          )}
        </View>{" "}
        {/* Center - Title */}
        <View style={styles.centerContainer}>
          <Text
            variant="h4"
            weight="semibold"
            style={[
              styles.title,
              {
                color: titleColor,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {/* Right side - Placeholder for balance */}
        <View style={styles.rightContainer} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 80,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 44 : 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,

    minHeight: 56,
  },
  leftContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  rightContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
});
