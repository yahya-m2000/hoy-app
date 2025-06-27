import { Stack } from "expo-router";

export default function CalendarLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[bookingId]"
        options={{
          title: "Booking Details",
          headerShown: true,
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
