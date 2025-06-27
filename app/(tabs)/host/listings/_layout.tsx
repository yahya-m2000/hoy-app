import React from "react";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";

export default function ListingsLayout() {
  const { theme, isDark } = useTheme();

  const HeaderAddButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/host/listings/add-property")}
      style={{ padding: 8 }}
    >
      <Ionicons
        name="add"
        size={24}
        color={isDark ? theme.white : theme.colors.gray[900]}
      />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
        },
        headerTintColor: isDark ? theme.white : theme.colors.gray[900],
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Properties",
          headerRight: () => <HeaderAddButton />,
        }}
      />
      <Stack.Screen
        name="property-details"
        options={({ route }) => ({
          title: "Property Details",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                const params = route.params as { id: string };
                router.push({
                  pathname: "/(tabs)/host/listings/add-property",
                  params: {
                    mode: "edit",
                    propertyId: params.id,
                  },
                });
              }}
              style={{ padding: 8 }}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color={isDark ? theme.white : theme.colors.gray[900]}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="add-property"
        options={({ route }) => {
          const params = route.params as { mode?: string };
          return {
            title: params?.mode === "edit" ? "Edit Property" : "Add Property",
            presentation: "modal",
            headerBackTitle: "",
          };
        }}
      />
    </Stack>
  );
}
