import { Stack } from "expo-router";
import { useThemedScreenOptions } from "@shared/navigation";
import { useTranslation } from "react-i18next";

export default function SearchLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
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
      <Stack.Screen
        name="results/index"
        options={{
          title: t("search.results"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
