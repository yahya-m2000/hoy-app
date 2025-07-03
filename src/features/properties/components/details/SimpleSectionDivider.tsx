import React from "react";
import { View, StyleSheet } from "react-native";

interface SectionDividerProps {
  style?: any;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ style }) => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
});

export default SectionDivider;
