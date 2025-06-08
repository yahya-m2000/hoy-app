import React from "react";
import { View, StyleSheet } from "react-native";
import { TokenDebugScreen } from "@modules/auth";
/**
 * Debug screen for testing the token refresh flow
 */
export default function TokenDebugPage() {
  return (
    <View style={styles.container}>
      <TokenDebugScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
