/**
 * Search screen for the Hoy application
 * Allows users to search and filter properties
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import spacing from "../../../src/constants/spacing";
import radius from "../../../src/constants/radius";
import PropertyCard from "../../../src/components/PropertyCard";
import SearchBar from "../../../src/components/SearchBar";
import { mockProperties } from "../../../src/utils/mockData";

type FilterOption =
  | "all"
  | "price"
  | "beach"
  | "cabin"
  | "design"
  | "countryside";

export default function SearchScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [showMap, setShowMap] = useState(false);
  const [properties, setProperties] = useState(mockProperties);

  // Filter properties based on search query
  const filteredProperties = searchQuery
    ? properties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : properties;

  // Apply active filter
  const applyFilter = (filter: FilterOption) => {
    setActiveFilter(filter);

    // In a real app, this would filter based on API calls or more sophisticated logic
    // For the demo, we'll just shuffle the properties for non-"all" filters
    if (filter !== "all") {
      setProperties([...mockProperties].sort(() => Math.random() - 0.5));
    } else {
      setProperties(mockProperties);
    }
  };

  const renderFilterOption = ({
    item,
  }: {
    item: { id: FilterOption; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        activeFilter === item.id && {
          backgroundColor: isDark ? theme.primary[700] : theme.primary[100],
          borderColor: theme.primary[500],
        },
        activeFilter !== item.id && {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
      onPress={() => applyFilter(item.id)}
    >
      <Text
        style={[
          styles.filterText,
          {
            color:
              activeFilter === item.id
                ? isDark
                  ? theme.primary[200]
                  : theme.primary[700]
                : isDark
                ? theme.colors.gray[300]
                : theme.colors.gray[700],
          },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Filter options data
  const filterOptions = [
    { id: "all" as FilterOption, label: t("filters.all") },
    { id: "price" as FilterOption, label: t("filters.price") },
    { id: "beach" as FilterOption, label: t("filters.beach") },
    { id: "cabin" as FilterOption, label: t("filters.cabin") },
    { id: "design" as FilterOption, label: t("filters.design") },
    { id: "countryside" as FilterOption, label: t("filters.countryside") },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("search.title")}
        </Text>
        <SearchBar
          placeholder={t("search.searchPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => console.log("Search submitted:", searchQuery)}
          editable={true}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterOption}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />

        <TouchableOpacity
          style={[
            styles.mapButton,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons
            name={showMap ? "list" : "map"}
            size={18}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
          <Text
            style={[
              styles.mapButtonText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {showMap ? t("search.showList") : t("search.showMap")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        <Text
          style={[
            styles.resultsText,
            { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
          ]}
        >
          {filteredProperties.length} {t("search.results")}
        </Text>
      </View>

      {showMap ? (
        <View
          style={[
            styles.mapContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[200],
            },
          ]}
        >
          <Text
            style={[
              styles.mapPlaceholder,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("search.mapPlaceholder")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              {...item}
              style={styles.propertyCard}
              onPress={() => {
                console.log(`Navigate to property ${item.id}`);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginRight: spacing.lg,
    borderWidth: 1,
    gap: spacing.xxs,
  },
  mapButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultsText: {
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  mapContainer: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    fontSize: fontSize.md,
    fontWeight: "500",
    textAlign: "center",
  },
});
