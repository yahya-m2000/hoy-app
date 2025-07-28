import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { iconSize, fontSize, fontWeight, spacing, radius } from "@core/design";

import { useTheme } from "@core/hooks";
import { Icon } from "@shared/components";

interface PropertyHeaderProps {
  propertyName?: string;
  propertyType?: string;
  onPress?: () => void;
  showDropdownIndicator?: boolean;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = memo(
  ({
    propertyName,
    propertyType = "house",
    onPress,
    showDropdownIndicator = true,
  }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    // Use translation for default property name if not provided
    const displayPropertyName = propertyName || t("features.property.details.defaultName");

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* Property Avatar with property type icon */}
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.colors?.primary || "#007AFF" },
          ]}
        >
          <Icon name="home" size={iconSize.sm} color="#FFFFFF" />
        </View>
        {/* Property Name */}
        <Text
          style={[
            styles.propertyName,
            { color: theme.text?.primary || "#000" },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayPropertyName}
        </Text>
        {/* Dropdown Indicator */}
        {showDropdownIndicator && (
          <Icon
            name="chevron-down"
            size={iconSize.xs}
            color={theme.text?.secondary || "#666"}
            style={styles.dropdownIcon}
          />
        )}
      </TouchableOpacity>
    );
  }
);

PropertyHeader.displayName = "PropertyHeader";

export { PropertyHeader };

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.circle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  propertyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    maxWidth: 120, // Limit width to prevent overflow
  },
  dropdownIcon: {
    marginLeft: spacing.xs,
  },
});
