import React from "react";
import { StyleSheet } from "react-native";
import { Screen } from "@shared/components/base";
import { HostSettingsContent } from "./components";

export default function HostSettingsScreen() {
  return (
    <Screen style={styles.container}>
      <HostSettingsContent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
