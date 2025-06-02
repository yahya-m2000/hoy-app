import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";

const SectionDivider: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[300],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
});

export default SectionDivider;
