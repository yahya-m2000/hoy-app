// React imports
import React from "react";

// React Native imports
import { View, StyleSheet } from "react-native";

// Types
import { ContainerProps } from "./Container.types";

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = "medium",
  backgroundColor = "transparent",
}) => {
  const paddingStyle = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
  }[padding];

  return (
    <View
      style={[
        styles.container,
        { padding: paddingStyle, backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Container;
