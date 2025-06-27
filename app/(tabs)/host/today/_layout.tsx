import { Stack } from "expo-router";

export default function TodayLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Today",
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
      <Stack.Screen
        name="all-reservations"
        options={{
          title: "All Reservations",
          headerShown: true,
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
