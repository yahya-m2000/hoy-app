/**
 * Font Test Debug Screen
 * For testing font loading and display
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "src/shared/components/base";

export default function FontTestScreen() {
  return (
    <View style={styles.container}>
      <Text>Font test screen - placeholder</Text>
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
