import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";

export type FilterOption = "all" | "price" | "rating" | "newest";
export type SortOrder = "asc" | "desc";

interface FiltersBarProps {
  activeFilter: FilterOption;
  sortOrder: SortOrder;
  showMap: boolean;
  onFilterChange: (filter: FilterOption) => void;
  onToggleMap: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  activeFilter,
  sortOrder,
  showMap,
  onFilterChange,
  onToggleMap,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const filterOptions = [
    { id: "all", label: t("search.filters.all") },
    { id: "price", label: t("search.filters.price") },
    { id: "rating", label: t("search.filters.rating") },
    { id: "newest", label: t("search.filters.newest") },
  ];

  const renderFilterOption = ({
    item,
  }: {
    item: { id: string; label: string };
  }) => {
    const isActive = activeFilter === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.filterOption,
          {
            backgroundColor: isActive
              ? theme.colors.primary
              : isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[50],
            borderColor: isActive
              ? theme.colors.primary
              : isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
            shadowColor: theme.colors.gray[900],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.1,
            shadowRadius: 2,
            elevation: isActive ? 3 : 0,
          },
        ]}
        onPress={() => onFilterChange(item.id as FilterOption)}
      >
        {isActive && item.id !== "all" && (
          <Ionicons
            name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
            size={12}
            color={theme.colors.white}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            styles.filterOptionText,
            {
              color: isActive
                ? theme.colors.white
                : isDark
                ? theme.colors.gray[300]
                : theme.colors.gray[700],
              fontWeight: isActive ? "600" : "normal",
            },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[900] : theme.white,
          borderBottomColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        },
      ]}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filterOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderFilterOption}
        contentContainerStyle={styles.filtersList}
      />

      <TouchableOpacity
        style={[
          styles.mapButton,
          {
            backgroundColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[50],
            borderColor: isDark
              ? theme.colors.gray[600]
              : theme.colors.gray[300],
            shadowColor: theme.colors.gray[900],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.1,
            shadowRadius: 2,
            elevation: 1,
          },
        ]}
        onPress={onToggleMap}
      >
        <Ionicons
          name={showMap ? "list" : "map"}
          size={16}
          color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flex: 1,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterOptionText: {
    fontSize: fontSize.xs,
    marginRight: 4,
  },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
  },
});
