import { Stack } from "expo-router";
import { PropertyProvider } from "@features/calendar/hooks/useProperty";

export default function CalendarLayout() {
  return (
    <PropertyProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="property/index"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="[reservationId]/index"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
      </Stack>
    </PropertyProvider>
  );
}
