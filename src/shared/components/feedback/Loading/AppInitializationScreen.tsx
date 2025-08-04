/**
 * App Initialization Screen
 * Stylish loading screen that shows during app startup and redirects
 * Matches the app theme and provides a seamless user experience
 */

import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useTheme } from "@core/hooks/useTheme";
import { Text } from "@shared/components/base/";
import { Container } from "@shared/components/layout";
import { spacing } from "@core/design";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface AppInitializationScreenProps {
  /** Optional text to show below the logo */
  subtitle?: string;
  /** Whether to show the pulsing animation */
  showAnimation?: boolean;
}

export const AppInitializationScreen: React.FC<
  AppInitializationScreenProps
> = ({ subtitle = "Loading your experience...", showAnimation = true }) => {
  const { theme, isDark } = useTheme();

  // Animation values
  // const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0.7);
  const subtitleOpacity = useSharedValue(0);
  const gradientProgress = useSharedValue(0);

  // Start animations on mount
  useEffect(() => {
    if (showAnimation) {
      // Logo fade in
      logoOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });

      // Subtitle fade in with delay
      setTimeout(() => {
        subtitleOpacity.value = withTiming(0.8, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        });
      }, 400);

      // Gradient color animation
      gradientProgress.value = withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [showAnimation, logoOpacity, subtitleOpacity]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  return (
    <Container
      flex={1}
      backgroundColor={theme.background}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="xl"
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* App Logo/Brand */}
      <Animated.View style={[logoAnimatedStyle]}>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center",
          paddingBottom: 8, // Add padding to prevent descender cutoff
        }}>
          <Text 
            variant="h2" 
            weight="black"
            style={{
              lineHeight: 54, // Increase line height to accommodate descenders
            }}
          >
            Hoy
          </Text>
          <MaskedView
            maskElement={
              <Text
                variant="h2"
                weight="black"
                style={{
                  backgroundColor: "transparent",
                  lineHeight: 54, // Match the "Hoy" text line height
                }}
              >
                bnb
              </Text>
            }
          >
            <Animated.View
              style={[
                useAnimatedStyle(() => ({
                  backgroundColor: interpolateColor(
                    gradientProgress.value,
                    [0, 0.33, 0.66, 1],
                    [
                      theme.colors.primary,
                      theme.colors.secondary,
                      theme.colors.tertiary,
                      theme.colors.primary,
                    ]
                  ),
                })),
              ]}
            >
              <Text
                variant="h2"
                weight="black"
                style={{
                  opacity: 0,
                  lineHeight: 54, // Match the mask element line height
                }}
              >
                bnb
              </Text>
            </Animated.View>
          </MaskedView>
        </View>
      </Animated.View>
    </Container>
  );
};

export default AppInitializationScreen;
