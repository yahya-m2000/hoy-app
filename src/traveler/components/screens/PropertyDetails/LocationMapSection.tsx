import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface LocationMapSectionProps {
  location: string;
  onShowMap: () => void;
}

const LocationMapSection: React.FC<LocationMapSectionProps> = ({
  location,
  onShowMap,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {t("property.whereYoullBe")}
      </Text>

      <TouchableOpacity
        style={[
          styles.mapContainer,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.grayPalette[100],
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[300],
          },
        ]}
        onPress={onShowMap}
      >
        <View style={styles.mapPlaceholder}>
          <Ionicons
            name="map"
            size={40}
            color={
              isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600]
            }
          />
          <Text
            style={[
              styles.mapText,
              {
                color: isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[700],
              },
            ]}
          >
            {t("property.tapToViewMap")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 14,
    lineHeight: 20,
  },
});

export { LocationMapSection };
