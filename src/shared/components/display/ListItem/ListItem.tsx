/**
 * ListItem component for displaying content items with consistent styling
 * Provides consistent item layout with icon, title, and description
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "src/core/hooks/useTheme";
import { Text } from "../../base/Text";
import { spacing, radius } from "@core/design";
import type { ListItemProps } from "./ListItem.types";

const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  description,
  highlight = false,
  spacing: itemSpacing = "md",
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme, itemSpacing);

  const iconColor = highlight ? theme.colors.primary : theme.text.secondary;

  const titleColor = highlight ? theme.colors.primary : theme.text.primary;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.header}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text
          variant="body"
          weight="semibold"
          color={titleColor}
          style={styles.title}
        >
          {title}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.text.secondary}
        style={styles.description}
      >
        {description}
      </Text>
    </View>
  );
};

const createStyles = (theme: any, itemSpacing: string) =>
  StyleSheet.create({
    container: {
      padding: spacing[itemSpacing as keyof typeof spacing] || spacing.md,
      borderRadius: radius.sm,
      marginBottom: spacing.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    icon: {
      marginRight: spacing.sm,
    },
    title: {
      flex: 1,
    },
    description: {
      lineHeight: 20,
      marginLeft: spacing.xs,
    },
  });

export default ListItem;
