import { Stack } from "expo-router";

export default function UtilitiesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="fix-account-data" 
        options={{
          title: "Fix Account Data",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
