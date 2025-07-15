import React from "react";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@core/hooks";
import { spacing, fontSize } from "@core/design";

export default function PropertiesLayout() {
  const { theme, isDark } = useTheme();
  const createBackPressHandler = (returnTo?: string) => () => {
    try {
      // Simple back navigation - let expo-router handle the logic
      if (router.canGoBack()) {
        router.back();
        return;
      }

      // Fallback to returnTo parameter or home
      const fallbackRoute = returnTo || "/(tabs)/traveler/home";
      router.replace(fallbackRoute as any);
    } catch (error) {
      console.warn("Navigation error, falling back to home:", error);
      router.replace("/(tabs)/traveler/home");
    }
  };
  const CustomBackButton = ({ returnTo }: { returnTo?: string }) => {
    const handleBackPress = createBackPressHandler(returnTo);

    // Safe color access with fallbacks
    const backButtonColor = (() => {
      try {
        if (isDark) {
          return theme?.colors?.gray?.[50] || "#ffffff";
        } else {
          return theme?.colors?.gray?.[900] || "#000000";
        }
      } catch (error) {
        console.warn("Error getting back button color:", error);
        return isDark ? "#ffffff" : "#000000";
      }
    })();

    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          padding: spacing?.xs || 8,
          borderRadius: spacing?.xs || 4,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back-outline"
          size={22}
          color={backButtonColor}
        />
      </TouchableOpacity>
    );
  };
  // Safe color access with fallbacks
  const titleColor = (() => {
    try {
      return theme?.text?.primary || (isDark ? "#ffffff" : "#000000");
    } catch (error) {
      console.warn("Error getting title color:", error);
      return isDark ? "#ffffff" : "#000000";
    }
  })();
  return (
    <Stack
      screenOptions={({ route }) => {
        const params = route.params as
          | {
              returnTo?: string;
            }
          | undefined;

        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTitleStyle: {
            fontSize: fontSize?.md || 16,
            fontWeight: "500",
            color: titleColor,
          },
          headerTitleAlign: "center",
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerBackTitle: "",
          headerTintColor: titleColor,
          headerShadowVisible: true,
          headerLeft: () => <CustomBackButton returnTo={params?.returnTo} />,
        };
      }}
    >
      <Stack.Screen
        name="property"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
