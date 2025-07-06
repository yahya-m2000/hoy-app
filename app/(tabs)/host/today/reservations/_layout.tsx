import { Stack } from "expo-router";

export default function ReservationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[reservationId]/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
