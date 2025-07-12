import React from "react";
import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@core/navigation";
import { t } from "i18next";

export default function SettingsLayout() {
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
        name="currency"
        options={{
          title: t("profile.currency"),
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="[setting]"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
