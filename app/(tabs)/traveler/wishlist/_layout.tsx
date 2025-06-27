import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";
import { CollectionHeader } from "@shared/components";

export default function WishlistLayout() {
  const themedOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => {
          const params = route.params as
            | { name?: string; propertyCount?: string }
            | undefined;
          const propertyCount = params?.propertyCount
            ? parseInt(params.propertyCount, 10)
            : undefined;
          const collectionName = params?.name
            ? decodeURIComponent(params.name)
            : "Collection";
          return {
            headerShown: true,
            headerTitle: () => (
              <CollectionHeader
                title={collectionName}
                propertyCount={propertyCount}
              />
            ),
            headerTitleAlign: "center",
          };
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
