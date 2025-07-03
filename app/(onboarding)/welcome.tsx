/**
 * Welcome Onboarding Screen
 * First screen in the onboarding flow
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "src/shared/components/base";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome screen - onboarding content will be implemented here</Text>
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
