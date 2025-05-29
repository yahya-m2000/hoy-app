/**
 * Role Change Loading Overlay Component
 * Shows when user is switching between traveler and host roles
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { fontSize } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { useTheme } from "../context/ThemeContext";
import { useUserRole } from "../context/UserRoleContext";

const { width, height } = Dimensions.get("window");

interface RoleChangeLoadingOverlayProps {
  visible: boolean;
}

const RoleChangeLoadingOverlay: React.FC<RoleChangeLoadingOverlayProps> = ({
  visible,
}) => {
  const { theme, isDark } = useTheme();
  const { userRole } = useUserRole();

  // Animation values
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const iconRotation = React.useRef(new Animated.Value(0)).current;

  // Text based on current role
  const roleText = userRole === "host" ? "Host Mode" : "Traveler Mode";

  // Animate when visibility changes
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation animation
      Animated.loop(
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Stop rotation
      iconRotation.stopAnimation();
    }
  }, [visible, opacity, scale, iconRotation]);

  // Calculate rotation for animation
  const spin = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Don't render if not visible
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BlurView
        intensity={20}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View
          style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </Animated.View>
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
        >
          Switching to {roleText}...
        </Text>
        <Text
          style={[
            styles.subText,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          Updating your experience
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    width: width * 0.8,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subText: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
});

export default RoleChangeLoadingOverlay;
