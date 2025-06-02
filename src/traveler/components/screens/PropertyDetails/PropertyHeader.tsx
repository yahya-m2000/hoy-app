import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import type { PropertyType } from "@common/types/property";

interface PropertyHeaderProps {
  property: PropertyType;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ property }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  // Determine listing type display text
  const getListingTypeText = () => {
    if (property.propertyType) {
      switch (property.propertyType.toLowerCase()) {
        case "apartment":
          return t("property.entireApartment");
        case "room":
          return t("property.privateRoom");
        case "house":
          return t("property.entireHouse");
        case "villa":
          return t("property.entireVilla");
        case "condo":
          return t("property.entireCondo");
        default:
          return t("property.entireProperty", {
            type: property.propertyType.toLowerCase(),
          });
      }
    }
    return t("property.entirePlace");
  };

  return (
    <>
      {/* Property Images */}
      <Image
        source={{
          uri: property.images?.[0] || "https://via.placeholder.com/400x300",
        }}
        style={{ width: "100%", height: 300 }}
        resizeMode="cover"
      />

      {/* Property Info */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text
          style={[
            styles.propertyTitle,
            {
              color: isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900],
            },
          ]}
        >
          {property.title}
        </Text>

        {/* Location and Listing Type */}
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
            <Text
              style={[
                styles.location,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {property.location}
            </Text>
          </View>

          <Text
            style={[
              styles.listingType,
              {
                color: isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[700],
              },
            ]}
          >
            {getListingTypeText()}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  listingType: {
    fontSize: 14,
  },
});

export default PropertyHeader;
