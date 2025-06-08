import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";

export default function SearchLayout() {
  const themedOptions = useThemedScreenOptions();
  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Find your perfect stay",
        }}
      />
      <Stack.Screen name="results/index" />{" "}
      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: true,
          headerTitle: "Property Details",
        }}
      />
    </Stack>
  );
}
