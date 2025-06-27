import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { spacing } from "@shared/constants";
import { useCurrentUser } from "@shared/hooks/useUser";
import { HostProfileHeader } from "./HostProfileHeader";
import { HostSettingsSections } from "./HostSettingsSections";
import { useHostSettings } from "../hooks";

/**
 * Main content component for host settings
 * Handles the scroll view and renders profile header and all settings sections
 */
export const HostSettingsContent: React.FC = () => {
  const { sections } = useHostSettings();
  const { data: user, isLoading } = useCurrentUser();

  const handleQRCodePress = () => {
    router.push("/host/settings/qr-code");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HostProfileHeader
        user={user || null}
        loading={isLoading}
        onQRCodePress={handleQRCodePress}
      />
      <HostSettingsSections sections={sections} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
});
