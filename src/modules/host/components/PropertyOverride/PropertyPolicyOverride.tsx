import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { Text, Button, Input } from "@shared/components/base";
import { spacing } from "@shared/constants";
import {
  PropertyInformation,
  CancellationPolicy,
  HouseRules,
  SafetyInformation,
} from "../../types/hostPolicies";

interface PropertyPolicyOverrideProps {
  propertyId: string;
  propertyName: string;
  defaultPolicies: {
    cancellationPolicy: CancellationPolicy;
    houseRules: HouseRules;
    safetyInformation: SafetyInformation;
    propertyInformation: PropertyInformation;
  };
  overrides?: {
    cancellationPolicy?: Partial<CancellationPolicy>;
    houseRules?: Partial<HouseRules>;
    safetyInformation?: Partial<SafetyInformation>;
    propertyInformation?: Partial<PropertyInformation>;
  };
  onSave: (overrides: any) => void;
  onCancel: () => void;
}

export const PropertyPolicyOverride: React.FC<PropertyPolicyOverrideProps> = ({
  propertyId,
  propertyName,
  defaultPolicies,
  overrides = {},
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    "cancellation" | "rules" | "safety" | "property"
  >("cancellation");
  const [formData, setFormData] = useState(overrides);

  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...data,
      },
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const tabs = [
    {
      id: "cancellation",
      title: t("host.policies.cancellation.title"),
      icon: "📅",
    },
    { id: "rules", title: t("host.policies.houseRules.title"), icon: "📋" },
    { id: "safety", title: t("host.policies.safety.title"), icon: "🛡️" },
    { id: "property", title: t("host.policies.property.title"), icon: "🏠" },
  ];

  const renderOverrideForm = () => {
    switch (activeTab) {
      case "cancellation":
        return (
          <View style={styles.overrideSection}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.overrides.cancellation.title")}
            </Text>
            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.sectionSubtitle}
            >
              {t("host.overrides.cancellation.subtitle")}
            </Text>

            <View style={styles.overrideToggle}>
              <Text variant="body">{t("host.overrides.useCustomPolicy")}</Text>
              {/* Toggle implementation would go here */}
            </View>

            {/* Custom cancellation policy form would go here */}
          </View>
        );

      case "rules":
        return (
          <View style={styles.overrideSection}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.overrides.rules.title")}
            </Text>
            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.sectionSubtitle}
            >
              {t("host.overrides.rules.subtitle")}
            </Text>

            {/* House rules override form would go here */}
          </View>
        );

      case "safety":
        return (
          <View style={styles.overrideSection}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.overrides.safety.title")}
            </Text>
            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.sectionSubtitle}
            >
              {t("host.overrides.safety.subtitle")}
            </Text>

            {/* Safety information override form would go here */}
          </View>
        );

      case "property":
        return (
          <View style={styles.overrideSection}>
            <Text variant="h4" style={styles.sectionTitle}>
              {t("host.overrides.property.title")}
            </Text>
            <Text
              variant="body"
              color={theme.text.secondary}
              style={styles.sectionSubtitle}
            >
              {t("host.overrides.property.subtitle")}
            </Text>

            <Input
              label={t("host.policies.property.wifi.network")}
              value={
                formData.propertyInformation?.wifiNetwork ||
                defaultPolicies.propertyInformation.wifiNetwork ||
                ""
              }
              onChangeText={(value) =>
                updateFormData("propertyInformation", { wifiNetwork: value })
              }
              placeholder={t("host.policies.property.wifi.networkPlaceholder")}
            />

            <Input
              label={t("host.policies.property.wifi.password")}
              value={
                formData.propertyInformation?.wifiPassword ||
                defaultPolicies.propertyInformation.wifiPassword ||
                ""
              }
              onChangeText={(value) =>
                updateFormData("propertyInformation", { wifiPassword: value })
              }
              placeholder={t("host.policies.property.wifi.passwordPlaceholder")}
              secureTextEntry
            />

            {/* Additional property-specific fields would go here */}
          </View>
        );

      default:
        return null;
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            {t("host.overrides.title")}
          </Text>
          <Text variant="h3" style={styles.propertyName}>
            {propertyName}
          </Text>
          <Text
            variant="body"
            color={theme.text.secondary}
            style={styles.subtitle}
          >
            {t("host.overrides.subtitle")}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "outline"}
              onPress={() => setActiveTab(tab.id as any)}
              style={styles.tab}
              title={`${tab.icon} ${tab.title}`}
            />
          ))}
        </View>

        {/* Form Content */}
        <View style={styles.content}>{renderOverrideForm()}</View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={onCancel}
            style={styles.actionButton}
            title={t("common.cancel")}
          />
          <Button
            onPress={handleSave}
            style={styles.actionButton}
            title={t("common.save")}
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    marginBottom: spacing.xs,
  },
  propertyName: {
    marginBottom: spacing.xs,
    color: "#2196F3",
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  tab: {
    flex: 1,
    minWidth: 120,
  },
  activeTab: {
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  overrideSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
  },
  overrideToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
