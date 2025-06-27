import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { Text, Input, Button } from "@shared/components/base";
import { spacing } from "@shared/constants";
import { SafetyInformation } from "../../types/hostPolicies";

interface SafetyInformationFormProps {
  data: Partial<SafetyInformation>;
  errors: Record<string, string>;
  onChange: (data: Partial<SafetyInformation>) => void;
}

export const SafetyInformationForm: React.FC<SafetyInformationFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [newSafetyInfo, setNewSafetyInfo] = useState("");

  const handleSwitchChange = (
    field: keyof SafetyInformation,
    value: boolean
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleSecurityCameraChange = (
    field: "present" | "location",
    value: any
  ) => {
    const currentCamera = data.securityCamera || {
      present: false,
      location: "",
    };

    onChange({
      ...data,
      securityCamera: {
        ...currentCamera,
        [field]: value,
      },
    });
  };

  const addSafetyInfo = () => {
    if (newSafetyInfo.trim()) {
      const currentInfo = data.additionalSafety || [];
      onChange({
        ...data,
        additionalSafety: [...currentInfo, newSafetyInfo.trim()],
      });
      setNewSafetyInfo("");
    }
  };

  const removeSafetyInfo = (index: number) => {
    const currentInfo = data.additionalSafety || [];
    onChange({
      ...data,
      additionalSafety: currentInfo.filter((_, i) => i !== index),
    });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text variant="h3" style={styles.title}>
          {t("host.policies.safety.title")}
        </Text>

        <Text
          variant="body"
          color={theme.text.secondary}
          style={styles.subtitle}
        >
          {t("host.policies.safety.subtitle")}
        </Text>

        <View style={styles.form}>
          {/* Smoke Detector */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.smokeDetector")}
              </Text>
            </View>
            <Switch
              value={data.smokeDetector || false}
              onValueChange={(value) =>
                handleSwitchChange("smokeDetector", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* Carbon Monoxide Detector */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.carbonMonoxideDetector")}
              </Text>
            </View>
            <Switch
              value={data.carbonMonoxideDetector || false}
              onValueChange={(value) =>
                handleSwitchChange("carbonMonoxideDetector", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* Fire Extinguisher */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.fireExtinguisher")}
              </Text>
            </View>
            <Switch
              value={data.fireExtinguisher || false}
              onValueChange={(value) =>
                handleSwitchChange("fireExtinguisher", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* First Aid Kit */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.firstAidKit")}
              </Text>
            </View>
            <Switch
              value={data.firstAidKit || false}
              onValueChange={(value) =>
                handleSwitchChange("firstAidKit", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* Security Camera */}
          <View style={styles.section}>
            <View style={styles.switchField}>
              <View style={styles.switchLabel}>
                <Text variant="label">
                  {t("host.policies.safety.securityCamera")}
                </Text>
              </View>
              <Switch
                value={data.securityCamera?.present || false}
                onValueChange={(value) =>
                  handleSecurityCameraChange("present", value)
                }
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>

            {data.securityCamera?.present && (
              <View style={styles.field}>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  style={styles.fieldLabel}
                >
                  {t("host.policies.safety.securityCameraLocation")}
                </Text>
                <Input
                  value={data.securityCamera?.location || ""}
                  onChangeText={(value) =>
                    handleSecurityCameraChange("location", value)
                  }
                  placeholder="e.g., Living room facing entrance"
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}
          </View>

          {/* Weapons on Property */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.weaponsOnProperty")}
              </Text>
            </View>
            <Switch
              value={data.weaponsOnProperty || false}
              onValueChange={(value) =>
                handleSwitchChange("weaponsOnProperty", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* Dangerous Animals */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.safety.dangerousAnimals")}
              </Text>
            </View>
            <Switch
              value={data.dangerousAnimals || false}
              onValueChange={(value) =>
                handleSwitchChange("dangerousAnimals", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          {/* Additional Safety Information */}
          <View style={styles.section}>
            <Text variant="label" style={styles.label}>
              {t("host.policies.safety.additionalSafety")}
            </Text>
            {/* Existing Safety Info */}
            {data.additionalSafety && data.additionalSafety.length > 0 && (
              <View style={styles.safetyList}>
                {data.additionalSafety.map((info, index) => (
                  <View
                    key={index}
                    style={[styles.safetyItem, { borderColor: theme.border }]}
                  >
                    <Text variant="body" style={styles.safetyText}>
                      {info}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeSafetyInfo(index)}
                      style={styles.removeButton}
                    >
                      <Text variant="caption" color={theme.colors.error}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {/* Add New Safety Info */}
            <View style={styles.addInfoContainer}>
              <Input
                value={newSafetyInfo}
                onChangeText={setNewSafetyInfo}
                placeholder={t("host.policies.safety.safetyPlaceholder")}
                multiline
                numberOfLines={3}
                style={styles.addInfoInput}
              />
              <Button
                title={t("host.policies.safety.addSafetyInfo")}
                variant="outline"
                onPress={addSafetyInfo}
                disabled={!newSafetyInfo.trim()}
                style={styles.addInfoButton}
              />
            </View>
          </View>
        </View>
      </View>
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
  field: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  switchField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  safetyList: {
    gap: spacing.sm,
  },
  safetyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  safetyText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addInfoContainer: {
    gap: spacing.sm,
  },
  addInfoInput: {
    minHeight: 80,
  },
  addInfoButton: {
    alignSelf: "flex-start",
  },
});
