import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@core/navigation";
import { CollectionHeader } from "@shared/components";

export default function WishlistLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/index"
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
