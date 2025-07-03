/**
 * Card Footer component
 * Handles footer content within cards
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { spacing } from "@core/design";
import { CardFooterProps } from "./types";

export const CardFooter: React.FC<CardFooterProps> = ({ style, children }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
});

export default CardFooter;
