/**
 * Reusable Custom Header Component
 * Provides consistent header design with centered title and left-aligned back button
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import BackButton from "@common-components/BackButton";

interface CustomHeaderProps {
  title: string;
  onBackPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  showBackButton?: boolean;
  style?: any;
}

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
        </View>

        {/* Center - Title */}
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.title,
              {
                color: titleColor,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
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
    fontSize: fontSize.lg,
    fontWeight: "600",
    textAlign: "center",
  },
});
