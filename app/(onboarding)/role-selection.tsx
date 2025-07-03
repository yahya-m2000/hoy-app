/**
 * Role Selection Onboarding Screen
 * User selects their primary role (host/traveler)
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "src/shared/components/base";

export default function RoleSelectionScreen() {
  return (
    <View style={styles.container}>
      <Text>
        Role selection screen - onboarding content will be implemented here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
