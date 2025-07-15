/**
 * Account section layout
 * Handles navigation for account-related screens
 */

import { Stack } from "expo-router";
import { t } from "i18next";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="qr-code"
        options={{
          title: t("account.qrCode"),
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="personal-info"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      {/* <Stack.Screen
        name="language"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      /> */}
      <Stack.Screen
        name="[setting]"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
