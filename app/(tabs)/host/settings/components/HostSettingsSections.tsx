import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsSection } from "@modules/account/components/Sections";
import { spacing } from "@shared/constants";
import type { HostSettingsSection } from "../utils/types";

export interface HostSettingsSectionsProps {
  sections: HostSettingsSection[];
}

/**
 * Renders all host settings sections
 * Takes an array of sections and renders them using the base SettingsSection component
 */
export const HostSettingsSections: React.FC<HostSettingsSectionsProps> = ({
  sections,
}) => {
  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <SettingsSection
          key={`${section.title}-${index}`}
          title={section.title}
          items={section.items}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
