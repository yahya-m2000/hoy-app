import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks/useTheme";

interface SectionDividerProps {
  style?: any;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ style }) => {
  const { theme } = useTheme();

  const dividerStyle = React.useMemo(
    () => [
      styles.divider,
      {
        backgroundColor: theme?.colors?.gray?.[200] || "#E5E5E5",
      },
      style,
    ],
    [theme, style]
  );

  return <View style={dividerStyle}></View>;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: 16,
  },
});

export default SectionDivider;
