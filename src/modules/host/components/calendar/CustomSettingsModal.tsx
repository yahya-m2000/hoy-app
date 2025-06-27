/**
 * Custom Settings Modal
 * Modal for editing minimum nights, advance notice, and promotions
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";

interface CustomSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: CustomSettings) => void;
  currentSettings: CustomSettings;
  selectedDates: string[];
}

export interface CustomSettings {
  minimumNights?: number;
  advanceNotice?: number;
  promotionPercentage?: number;
  allowInstantBook?: boolean;
}

const CustomSettingsModal: React.FC<CustomSettingsModalProps> = ({
  isVisible,
  onClose,
  onSave,
  currentSettings,
  selectedDates,
}) => {
  const theme = useTheme();
  const [settings, setSettings] = useState<CustomSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isVisible]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const formatSelectedDatesText = () => {
    if (selectedDates.length === 1) {
      const date = new Date(selectedDates[0]);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (selectedDates.length === 2) {
      const startDate = new Date(selectedDates[0]);
      const endDate = new Date(selectedDates[1]);
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }

    return `${selectedDates.length} selected dates`;
  };

  const updateSetting = <K extends keyof CustomSettings>(
    key: K,
    value: CustomSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </Pressable>

          <Text style={[styles.title, { color: theme.text.primary }]}>
            Custom Settings
          </Text>

          <Pressable
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.saveText, { color: theme.colors.white }]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Selected dates info */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>
              Selected dates
            </Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>
              {formatSelectedDatesText()}
            </Text>
          </View>

          {/* Minimum Nights */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
              Minimum nights
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.text.secondary },
              ]}
            >
              Set the minimum number of nights guests must book
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <TextInput
                style={[styles.numberInput, { color: theme.text.primary }]}
                value={settings.minimumNights?.toString() || ""}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ""));
                  updateSetting("minimumNights", isNaN(num) ? undefined : num);
                }}
                placeholder="1"
                placeholderTextColor={theme.text.disabled}
                keyboardType="number-pad"
              />
              <Text
                style={[styles.inputSuffix, { color: theme.text.secondary }]}
              >
                nights
              </Text>
            </View>
          </View>

          {/* Advance Notice */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
              Advance notice
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.text.secondary },
              ]}
            >
              How far in advance guests must book
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <TextInput
                style={[styles.numberInput, { color: theme.text.primary }]}
                value={settings.advanceNotice?.toString() || ""}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ""));
                  updateSetting("advanceNotice", isNaN(num) ? undefined : num);
                }}
                placeholder="0"
                placeholderTextColor={theme.text.disabled}
                keyboardType="number-pad"
              />
              <Text
                style={[styles.inputSuffix, { color: theme.text.secondary }]}
              >
                days
              </Text>
            </View>
          </View>

          {/* Promotion Percentage */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
              Promotion discount
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: theme.text.secondary },
              ]}
            >
              Percentage discount for these dates
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <TextInput
                style={[styles.numberInput, { color: theme.text.primary }]}
                value={settings.promotionPercentage?.toString() || ""}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(/[^0-9.]/g, ""));
                  updateSetting(
                    "promotionPercentage",
                    isNaN(num) ? undefined : Math.min(100, Math.max(0, num))
                  );
                }}
                placeholder="0"
                placeholderTextColor={theme.text.disabled}
                keyboardType="decimal-pad"
              />
              <Text
                style={[styles.inputSuffix, { color: theme.text.secondary }]}
              >
                % off
              </Text>
            </View>

            {settings.promotionPercentage &&
              settings.promotionPercentage > 0 && (
                <View
                  style={[
                    styles.promotionPreview,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.promotionText,
                      { color: theme.colors.success },
                    ]}
                  >
                    {settings.promotionPercentage}% discount will be applied
                  </Text>
                </View>
              )}
          </View>

          {/* Instant Book */}
          <View style={styles.settingSection}>
            <View style={styles.switchContainer}>
              <View style={styles.switchText}>
                <Text
                  style={[styles.settingTitle, { color: theme.text.primary }]}
                >
                  Allow instant book
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.text.secondary },
                  ]}
                >
                  Guests can book immediately without approval
                </Text>
              </View>

              <Switch
                value={settings.allowInstantBook || false}
                onValueChange={(value) =>
                  updateSetting("allowInstantBook", value)
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>

          {/* Summary */}
          <View
            style={[
              styles.summarySection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: theme.text.primary }]}>
              Settings Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                Minimum nights:
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {settings.minimumNights || "Default"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                Advance notice:
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {settings.advanceNotice
                  ? `${settings.advanceNotice} days`
                  : "Same day"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                Promotion:
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {settings.promotionPercentage
                  ? `${settings.promotionPercentage}% off`
                  : "None"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                Instant book:
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {settings.allowInstantBook ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
  },
  settingSection: {
    marginBottom: 32,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  promotionPreview: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  promotionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchText: {
    flex: 1,
    marginRight: 16,
  },
  summarySection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CustomSettingsModal;
