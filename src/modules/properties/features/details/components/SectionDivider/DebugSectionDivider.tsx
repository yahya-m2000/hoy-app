import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";

interface DebugSectionDividerProps {
  style?: any;
}

const DebugSectionDivider: React.FC<DebugSectionDividerProps> = ({ style }) => {
  console.log("SectionDivider rendered");

  try {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.divider} />
        {/* Debug: Add a text element to see if it causes issues */}
        <Text style={styles.debugText}>DEBUG: SectionDivider rendered</Text>
      </View>
    );
  } catch (error) {
    console.error("SectionDivider render error:", error);
    return <View style={styles.fallback} />;
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  debugText: {
    fontSize: 10,
    color: "red",
    textAlign: "center",
  },
  fallback: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
});

export default DebugSectionDivider;
