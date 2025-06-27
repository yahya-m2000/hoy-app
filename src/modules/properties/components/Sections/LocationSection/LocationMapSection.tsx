import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface LocationMapSectionProps {
  location: string;
  onShowMap: () => void;
}

const LocationMapSection: React.FC<LocationMapSectionProps> = ({
  location,
  onShowMap,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {t("property.whereYoullBe")}
      </Text>

      <TouchableOpacity style={styles.mapContainer} onPress={onShowMap}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={40} color={theme.colors.gray[400]} />
          <Text style={[styles.mapText, { color: theme.text.secondary }]}>
            {t("property.tapToViewMap")}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.locationText, { color: theme.text.primary }]}>
        {location}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  mapPlaceholder: {
    alignItems: "center",
    gap: spacing.sm,
  },
  mapText: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
});

export { LocationMapSection };
