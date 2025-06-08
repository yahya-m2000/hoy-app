import React from "react";
import { FlatList, View, RefreshControl, StyleSheet } from "react-native";
import { useTheme } from "@shared/context/ThemeContext";
import { spacing } from "@shared/constants/spacing";
import PropertyCard from "../Cards/PropertyCard";
import type { PropertyType } from "@shared/types/property";

interface PropertyListProps {
  properties: PropertyType[];
  refreshing: boolean;
  onRefresh: () => void;
  onPropertyPress: (property: PropertyType) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  refreshing,
  onRefresh,
  onPropertyPress,
}) => {
  const { theme, isDark } = useTheme();
  const renderProperty = ({ item }: { item: PropertyType }) => {
    // Create location text from new address structure
    const locationText =
      item.address?.city && item.address?.country
        ? `${item.address.city}, ${item.address.country}`
        : "Location not available";

    return (
      <View style={styles.propertyCard}>
        {" "}
        <PropertyCard
          _id={item._id}
          name={item.name || item.title}
          price={
            typeof item.price === "object" ? item.price.amount : item.price
          }
          rating={item.rating}
          reviewCount={item.reviewCount}
          imageUrl={item.images?.[0]}
          onPress={() => onPropertyPress(item)}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item._id || Math.random().toString()}
      renderItem={renderProperty}
      contentContainerStyle={[
        styles.listContent,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          progressBackgroundColor={
            isDark ? theme.colors.gray[800] : theme.white
          }
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
});
