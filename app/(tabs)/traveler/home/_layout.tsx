/**
 * Layout for home screen
 */

import { Stack } from "expo-router";
// import { useThemedScreenOptions } from "@shared/navigation";
// import { Text } from "react-native";
// import { getPropertyTitle } from "@shared/utils/propertyUtils";
// import { PropertyType } from "@shared/types";
// import { fontSize } from "@shared/constants";

export default function HomeLayout() {
  // const themedOptions = useThemedScreenOptions();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="property"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
