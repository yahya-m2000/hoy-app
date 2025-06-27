import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { Text, Input } from "@shared/components/base";
import { spacing } from "@shared/constants";
import { PropertyInformation } from "../../types/hostPolicies";

interface PropertyInformationFormProps {
  data: Partial<PropertyInformation>;
  errors: Record<string, string>;
  onChange: (data: Partial<PropertyInformation>) => void;
}

interface AmenityItemProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: () => void;
}

const AmenityItem: React.FC<AmenityItemProps> = ({
  icon,
  label,
  value,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.amenityItem, { borderBottomColor: theme.border }]}>
      <View style={styles.amenityContent}>
        <Text style={styles.amenityIcon}>{icon}</Text>
        <Text variant="body">{label}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
};

export const PropertyInformationForm: React.FC<
  PropertyInformationFormProps
> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const updateField = (field: keyof PropertyInformation, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateAmenity = (amenity: string, value: boolean) => {
    const currentAmenities = data.amenities || [];
    const updatedAmenities = value
      ? [...currentAmenities, amenity]
      : currentAmenities.filter((a: string) => a !== amenity);
    updateField("amenities", updatedAmenities);
  };

  const amenitiesList = [
    {
      key: "wifi",
      icon: "📶",
      label: t("host.policies.property.amenities.wifi"),
    },
    {
      key: "parking",
      icon: "🚗",
      label: t("host.policies.property.amenities.parking"),
    },
    {
      key: "kitchen",
      icon: "🍳",
      label: t("host.policies.property.amenities.kitchen"),
    },
    {
      key: "washer",
      icon: "🧺",
      label: t("host.policies.property.amenities.washer"),
    },
    {
      key: "dryer",
      icon: "🌀",
      label: t("host.policies.property.amenities.dryer"),
    },
    { key: "ac", icon: "❄️", label: t("host.policies.property.amenities.ac") },
    {
      key: "heating",
      icon: "🔥",
      label: t("host.policies.property.amenities.heating"),
    },
    { key: "tv", icon: "📺", label: t("host.policies.property.amenities.tv") },
    {
      key: "pool",
      icon: "🏊",
      label: t("host.policies.property.amenities.pool"),
    },
    {
      key: "gym",
      icon: "💪",
      label: t("host.policies.property.amenities.gym"),
    },
    {
      key: "balcony",
      icon: "🏗️",
      label: t("host.policies.property.amenities.balcony"),
    },
    {
      key: "garden",
      icon: "🌿",
      label: t("host.policies.property.amenities.garden"),
    },
  ];
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text variant="h3" style={styles.title}>
          {t("host.policies.property.title")}
        </Text>

        <Text
          variant="body"
          color={theme.text.secondary}
          style={styles.subtitle}
        >
          {t("host.policies.property.subtitle")}
        </Text>

        <View style={styles.form}>
          {/* WiFi Information */}
          <View style={styles.section}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.policies.property.wifi.title")}
            </Text>

            <Input
              label={t("host.policies.property.wifi.network")}
              value={data.wifiNetwork || ""}
              onChangeText={(value) => updateField("wifiNetwork", value)}
              placeholder={t("host.policies.property.wifi.networkPlaceholder")}
              error={errors.wifiNetwork}
            />

            <Input
              label={t("host.policies.property.wifi.password")}
              value={data.wifiPassword || ""}
              onChangeText={(value) => updateField("wifiPassword", value)}
              placeholder={t("host.policies.property.wifi.passwordPlaceholder")}
              error={errors.wifiPassword}
              secureTextEntry
            />
          </View>

          {/* Check-in Instructions */}
          <View style={styles.section}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.policies.property.checkin.title")}
            </Text>

            <Input
              label={t("host.policies.property.checkin.instructions")}
              value={data.checkInInstructions || ""}
              onChangeText={(value) =>
                updateField("checkInInstructions", value)
              }
              placeholder={t(
                "host.policies.property.checkin.instructionsPlaceholder"
              )}
              multiline
              numberOfLines={4}
              error={errors.checkInInstructions}
            />

            <Input
              label={t("host.policies.property.checkin.keyLocation")}
              value={data.keyLocation || ""}
              onChangeText={(value) => updateField("keyLocation", value)}
              placeholder={t(
                "host.policies.property.checkin.keyLocationPlaceholder"
              )}
              error={errors.keyLocation}
            />
          </View>

          {/* Parking Information */}
          <View style={styles.section}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.policies.property.parking.title")}
            </Text>

            <Input
              label={t("host.policies.property.parking.instructions")}
              value={data.parkingInstructions || ""}
              onChangeText={(value) =>
                updateField("parkingInstructions", value)
              }
              placeholder={t(
                "host.policies.property.parking.instructionsPlaceholder"
              )}
              multiline
              numberOfLines={3}
              error={errors.parkingInstructions}
            />
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.policies.property.amenities.title")}
            </Text>

            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.sectionSubtitle}
            >
              {t("host.policies.property.amenities.subtitle")}
            </Text>
            <View
              style={[
                styles.amenitiesContainer,
                { backgroundColor: theme.background },
              ]}
            >
              {amenitiesList.map((amenity) => (
                <AmenityItem
                  key={amenity.key}
                  icon={amenity.icon}
                  label={amenity.label}
                  value={(data.amenities || []).includes(amenity.key)}
                  onToggle={() =>
                    updateAmenity(
                      amenity.key,
                      !(data.amenities || []).includes(amenity.key)
                    )
                  }
                />
              ))}
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.policies.property.notes.title")}
            </Text>
            <Input
              label={t("host.policies.property.notes.additional")}
              value={data.additionalNotes || ""}
              onChangeText={(value) => updateField("additionalNotes", value)}
              placeholder={t(
                "host.policies.property.notes.additionalPlaceholder"
              )}
              multiline
              numberOfLines={4}
              error={errors.additionalNotes}
            />
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: spacing.sm,
  },
  amenitiesContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  amenityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  amenityIcon: {
    fontSize: 20,
    width: 24,
  },
});
