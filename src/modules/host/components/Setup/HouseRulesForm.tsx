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
import { Text, Input, Button, TimeInput } from "@shared/components/base";
import { spacing } from "@shared/constants";
import { HouseRules } from "../../types/hostPolicies";

interface HouseRulesFormProps {
  data: Partial<HouseRules>;
  errors: Record<string, string>;
  onChange: (data: Partial<HouseRules>) => void;
}

export const HouseRulesForm: React.FC<HouseRulesFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [newRule, setNewRule] = useState("");

  const handleInputChange = (field: keyof HouseRules, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleSwitchChange = (field: keyof HouseRules, value: boolean) => {
    onChange({
      ...data,
      [field]: value,
    });
  };
  const handleQuietHoursChange = (
    field: "enabled" | "start" | "end",
    value: any
  ) => {
    const currentQuietHours = data.quietHours || {
      enabled: false,
      start: "10:00 PM",
      end: "8:00 AM",
    };

    onChange({
      ...data,
      quietHours: {
        ...currentQuietHours,
        [field]: value,
      },
    });
  };

  const addAdditionalRule = () => {
    if (newRule.trim()) {
      const currentRules = data.additionalRules || [];
      onChange({
        ...data,
        additionalRules: [...currentRules, newRule.trim()],
      });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    const currentRules = data.additionalRules || [];
    onChange({
      ...data,
      additionalRules: currentRules.filter((_, i) => i !== index),
    });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text variant="h3" style={styles.title}>
          {t("host.policies.houseRules.title")}
        </Text>

        <Text
          variant="body"
          color={theme.text.secondary}
          style={styles.subtitle}
        >
          {t("host.policies.houseRules.subtitle")}
        </Text>

        <View style={styles.form}>
          {/* Check-in Time */}
          <View style={styles.field}>
            <TimeInput
              value={data.checkInTime || ""}
              onChangeText={(value) => handleInputChange("checkInTime", value)}
              label={t("host.policies.houseRules.checkIn")}
              placeholder="15:00"
              error={errors.checkInTime}
            />
          </View>
          {/* Check-out Time */}
          <View style={styles.field}>
            <TimeInput
              value={data.checkOutTime || ""}
              onChangeText={(value) => handleInputChange("checkOutTime", value)}
              label={t("host.policies.houseRules.checkOut")}
              placeholder="11:00"
              error={errors.checkOutTime}
            />
          </View>
          {/* Smoking Allowed */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.houseRules.smoking")}
              </Text>
            </View>
            <Switch
              value={data.smokingAllowed || false}
              onValueChange={(value) =>
                handleSwitchChange("smokingAllowed", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
          {/* Pets Allowed */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">{t("host.policies.houseRules.pets")}</Text>
            </View>
            <Switch
              value={data.petsAllowed || false}
              onValueChange={(value) =>
                handleSwitchChange("petsAllowed", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
          {/* Parties Allowed */}
          <View style={styles.switchField}>
            <View style={styles.switchLabel}>
              <Text variant="label">
                {t("host.policies.houseRules.parties")}
              </Text>
            </View>
            <Switch
              value={data.partiesAllowed || false}
              onValueChange={(value) =>
                handleSwitchChange("partiesAllowed", value)
              }
              trackColor={{
                false: theme.colors.gray[300],
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
          {/* Quiet Hours */}
          <View style={styles.section}>
            <View style={styles.switchField}>
              <View style={styles.switchLabel}>
                <Text variant="label">
                  {t("host.policies.houseRules.quietHours")}
                </Text>
              </View>
              <Switch
                value={data.quietHours?.enabled || false}
                onValueChange={(value) =>
                  handleQuietHoursChange("enabled", value)
                }
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>
            {data.quietHours?.enabled && (
              <View style={styles.timeFields}>
                <View style={styles.timeField}>
                  <TimeInput
                    value={data.quietHours?.start || ""}
                    onChangeText={(value) =>
                      handleQuietHoursChange("start", value)
                    }
                    label={t("host.policies.houseRules.quietHoursStart")}
                    placeholder="22:00"
                    error={errors.quietHoursStart}
                  />
                </View>
                <View style={styles.timeField}>
                  <TimeInput
                    value={data.quietHours?.end || ""}
                    onChangeText={(value) =>
                      handleQuietHoursChange("end", value)
                    }
                    label={t("host.policies.houseRules.quietHoursEnd")}
                    placeholder="08:00"
                    error={errors.quietHoursEnd}
                  />
                </View>
              </View>
            )}
          </View>
          {/* Additional Rules */}
          <View style={styles.section}>
            <Text variant="label" style={styles.label}>
              {t("host.policies.houseRules.additionalRules")}
            </Text>
            {/* Existing Rules */}
            {data.additionalRules && data.additionalRules.length > 0 && (
              <View style={styles.rulesList}>
                {data.additionalRules.map((rule, index) => (
                  <View
                    key={index}
                    style={[styles.ruleItem, { borderColor: theme.border }]}
                  >
                    <Text variant="body" style={styles.ruleText}>
                      {rule}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeRule(index)}
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
            {/* Add New Rule */}
            <View style={styles.addRuleContainer}>
              <Input
                value={newRule}
                onChangeText={setNewRule}
                placeholder={t("host.policies.houseRules.rulePlaceholder")}
                multiline
                numberOfLines={2}
                style={styles.addRuleInput}
              />
              <Button
                title={t("host.policies.houseRules.addRule")}
                variant="outline"
                onPress={addAdditionalRule}
                disabled={!newRule.trim()}
                style={styles.addRuleButton}
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
  timeFields: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  timeField: {
    flex: 1,
    gap: spacing.xs,
  },
  timeLabel: {
    marginBottom: spacing.xs,
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  ruleText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addRuleContainer: {
    gap: spacing.sm,
  },
  addRuleInput: {
    minHeight: 60,
  },
  addRuleButton: {
    alignSelf: "flex-start",
  },
});
