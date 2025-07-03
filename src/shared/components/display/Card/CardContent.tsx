/**
 * Card Content component
 * Handles main content area within cards
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { spacing } from "@core/design";
import { CardContentProps } from "./types";

export const CardContent: React.FC<CardContentProps> = ({
  style,
  children,
}) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
});

export default CardContent;
