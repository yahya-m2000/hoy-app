import React from "react";
import { Stack, router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPropertyTitle } from "@shared/utils/propertyUtils";
import type { PropertyType } from "@shared/types";
import { useTheme } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";

export default function PropertiesLayout() {
  const { theme, isDark } = useTheme();
  const createBackPressHandler = (returnTo?: string) => () => {
    try {
      // First, always try to go back normally to preserve animations
      if (router.canGoBack()) {
        console.log("Using router.back() to preserve animations");
        router.back();
        return;
      }

      // If we can't go back but have a returnTo parameter, use push to maintain tab context
      if (returnTo) {
        console.log(
          "Cannot go back, navigating to returnTo with push:",
          returnTo
        );
        router.push(returnTo as any);
        return;
      }

      // Last fallback to home
      console.log(
        "No navigation history and no returnTo, falling back to home"
      );
      router.push("/(tabs)/traveler/home");
    } catch (error) {
      console.warn("Navigation error, falling back to home:", error);
      router.push("/(tabs)/traveler/home");
    }
  };
  const CustomBackButton = ({ returnTo }: { returnTo?: string }) => {
    const handleBackPress = createBackPressHandler(returnTo);

    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          padding: spacing.xs,
          borderRadius: spacing.xs,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={
            isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900]
          }
        />
      </TouchableOpacity>
    );
  };

  const titleColor = isDark ? theme.white : theme.black;
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
            fontSize: fontSize.md,
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
        name="[id]/index"
        options={({ route }) => {
          const params = route.params as
            | {
                property?: string;
                name?: string;
              }
            | undefined;

          let propertyTitle = "Property Details";

          if (params?.property) {
            try {
              const property: PropertyType = JSON.parse(params.property);
              propertyTitle = getPropertyTitle(property);
            } catch (error) {
              console.warn("Failed to parse property data:", error);
            }
          } else if (params?.name) {
            propertyTitle = decodeURIComponent(params.name);
          }
          return {
            headerShown: true,
            headerTitle: () => (
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: "500",
                  color: titleColor,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {propertyTitle}
              </Text>
            ),
          };
        }}
      />
    </Stack>
  );
}
