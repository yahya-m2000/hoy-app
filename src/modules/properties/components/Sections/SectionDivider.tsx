import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

const SectionDivider: React.FC = () => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return <View style={styles.divider} />;
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: theme.colors.gray[200],
    },
  });

export default SectionDivider;
