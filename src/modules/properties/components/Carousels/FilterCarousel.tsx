/**
 * Filter Carousel Component
 * Horizontal scrollable filter options
 */

import React from "react";
import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@shared/context";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterCarouselProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterCarousel: React.FC<FilterCarouselProps> = ({
  options,
  activeFilter,
  onFilterChange,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {options.map((option) => {
        const isActive = option.key === activeFilter;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[100],
                borderColor: isActive
                  ? theme.colors.primary
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => onFilterChange(option.key)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: isActive
                    ? theme.white
                    : isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700],
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default FilterCarousel;
