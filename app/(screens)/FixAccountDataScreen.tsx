// Hotfix screen for account data issues
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { resetAllAppData } from "../../src/utils/cacheBuster";
import { router } from "expo-router";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { fontSize } from "../../src/constants/typography";

export default function FixAccountDataScreen() {
  const { theme, isDark } = useTheme();
  const [isResetting, setIsResetting] = useState(false);

  // Function to handle data reset
  const handleDataReset = async () => {
    setIsResetting(true);
    try {
      const success = await resetAllAppData();

      if (success) {
        Alert.alert(
          "Reset Complete",
          "All app data has been reset successfully. The app will now return to the home screen.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/home"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Reset Failed",
          "There was a problem resetting app data. Please try force-closing and reopening the app.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="alert-circle"
            size={80}
            color={theme.colors.warning[500]}
          />
        </View>
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          Data Issue Detected
        </Text>
        <Text
          style={[
            styles.description,
            { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
          ]}
        >
          We&apos;ve detected an issue with your account data that might cause
          you to see incorrect information or content from other accounts.
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              marginBottom: spacing.xl,
              fontWeight: "500",
            },
          ]}
        >
          To fix this, we recommend resetting your app data. This will log you
          out but will ensure you have a clean, secure experience.
        </Text>
        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: theme.colors.primary[500],
              opacity: isResetting ? 0.7 : 1,
            },
          ]}
          onPress={handleDataReset}
          disabled={isResetting}
        >
          {isResetting ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <>
              <Ionicons
                name="refresh-circle-outline"
                size={20}
                color={theme.white}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: theme.white }]}>
                Reset App Data
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: theme.colors.gray[400] }]}
          onPress={() => router.back()}
          disabled={isResetting}
        >
          <Text
            style={[
              styles.skipButtonText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            Continue Without Resetting
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    width: "100%",
    marginBottom: spacing.md,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: fontSize.md,
  },
});
