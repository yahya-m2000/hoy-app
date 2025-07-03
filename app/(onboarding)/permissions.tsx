/**
 * Permissions Onboarding Screen
 * Request necessary app permissions
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "src/shared/components/base";

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <Text>
        Permissions screen - onboarding content will be implemented here
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
