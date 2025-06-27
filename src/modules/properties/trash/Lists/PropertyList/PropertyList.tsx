import React from "react";
import { FlatList, View, RefreshControl, StyleSheet } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants/spacing";
import PropertyCard from "../../Cards/PropertyCard";
import type { PropertyType } from "@shared/types/property";
import type { PropertyListProps } from "../../types/lists";

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  refreshing,
  onRefresh,
  onPropertyPress,
}) => {
  const { theme, isDark } = useTheme();
  const renderProperty = ({ item }: { item: PropertyType }) => {
    return (
      <View style={styles.propertyCard}>
        <PropertyCard
          _id={item._id}
          name={item.name || item.title}
          price={
            typeof item.price === "object" ? item.price.amount : item.price
          }
          imageUrl={item.images?.[0]}
          rating={item.rating}
          reviewCount={item.reviewCount}
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
