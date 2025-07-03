import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks";
import { radius, spacing } from "@core/design";

const Card = ({ children, style, ...props }: any) => {
  const { theme } = useTheme();

  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...props,
  };

  return <View style={[styles.shadow, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export { Card };
