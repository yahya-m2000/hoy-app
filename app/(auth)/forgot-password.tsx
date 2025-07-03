/**
 * Forgot Password Screen
 * Password reset functionality
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text>Forgot password screen - content will be migrated here</Text>
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
