// React
import React from "react";

// React Native
import { View, StyleSheet, SafeAreaView } from "react-native";

// Types
import { ScreenProps } from "./Screen.types";

const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  useSafeArea = true,
  backgroundColor = "#ffffff",
  padding = "medium",
}) => {
  const paddingStyle = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
  }[padding];

  const WrapperComponent = useSafeArea ? SafeAreaView : View;

  return (
    <WrapperComponent
      style={[styles.screen, { backgroundColor, padding: paddingStyle }, style]}
    >
      {children}
    </WrapperComponent>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export default Screen;
