import React from "react";
import { FlatList, View, RefreshControl, StyleSheet } from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import PropertyCard from "@common/components/PropertyCard";
import type { PropertyType } from "@common/types/property";

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
    // Make sure we have a valid location string
    const locationText =
      typeof item.location === "string"
        ? item.location
        : item.locationString || `${item.city || ""}, ${item.country || ""}`;
    return (
      <View style={styles.propertyCard}>
        <PropertyCard
          _id={item._id}
          title={item.title}
          location={locationText}
          price={item.price}
          rating={item.rating}
          reviewCount={item.reviewCount}
          images={item.images}
          city={item.city}
          address={item.address}
          hostId={item.hostId}
          hostName={item.hostName}
          hostImage={item.hostImage}
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
