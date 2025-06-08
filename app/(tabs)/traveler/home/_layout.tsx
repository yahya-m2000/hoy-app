/**
 * Layout for home screen
 */

import { Stack } from "expo-router";
import { Text } from "react-native";
import { useThemedScreenOptions } from "@shared/navigation";
import { getPropertyTitle } from "@shared/utils/propertyUtils";
import { PropertyType } from "@shared/types";
import { fontSize } from "@shared/constants";

export default function HomeLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Hoy",
        }}
      />{" "}
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
