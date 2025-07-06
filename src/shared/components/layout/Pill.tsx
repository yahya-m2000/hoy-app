import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@core/hooks";

const Pill = ({ label, variant = "default", ...props }: any) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case "info":
        return {
          backgroundColor: theme.info,
          textColor: theme.white,
        } as const;
      default:
        return {
          backgroundColor: theme.surface,
          textColor: theme.text.primary,
        } as const;
    }
  };

  const colors = getColors();
  const pillStyle = {
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...props,
  };

  return (
    <View style={pillStyle}>
      <Text style={{ color: colors.textColor, fontSize: 14 }}>{label}</Text>
    </View>
  );
};

export { Pill };
