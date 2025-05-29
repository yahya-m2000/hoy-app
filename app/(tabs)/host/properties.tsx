/**
 * Host Properties Screen connected to backend API - Updated May 12, 2025
 * Displays all properties managed by the host with filtering and search capabilities
 * Includes property status management, occupancy rates, and navigation to property details
 */

// React Native core
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

// Expo and third-party libraries
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// App context and hooks
import { useTheme } from "../../../src/common/context/ThemeContext";
import { useUserRole } from "../../../src/common/context/UserRoleContext";
import { useCurrency } from "../../../src/common/hooks/useCurrency";

// Components
import EmptyState from "../../../src/common/components/EmptyState";

// Services
import { fetchHostProperties } from "../../../src/host/services/hostService";

// Types
import type { PropertyType } from "../../../src/common/types/property";

// Constants
import { spacing } from "../../../src/common/constants/spacing";
import { fontSize } from "../../../src/common/constants/typography";
import { radius } from "../../../src/common/constants/radius";

// Use PropertyType from our types instead of defining it inline
type Property = PropertyType & {
  occupancyRate: number; // Add any extra fields needed for UI that aren't in the API
  isActive: boolean;
};

// Properties screen component
const PropertiesScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost } = useUserRole();
  const { getSymbol } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [refreshing, setRefreshing] = useState(false);

  // Query for host properties using the hostService
  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hostProperties", filter],
    queryFn: () => fetchHostProperties(filter),
    select: (data) =>
      data.map((prop) => ({
        ...prop,
        _id: prop.id, // Ensure _id is set from API id
        description: prop.title, // Add required description field
        isActive: prop.isActive ?? true,
        occupancyRate: prop.occupancyRate ?? Math.floor(Math.random() * 100),
        image: prop.images?.[0] || "https://picsum.photos/500/300?random=1",
        reviews: prop.reviewCount || 0,
        rating: prop.rating || 4.5,
      })) as Property[],
  });

  // Filter properties based on search and filter
  const filteredProperties = React.useMemo(() => {
    if (!properties) return [];

    return properties.filter((property) => {
      // Search filter
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [properties, searchQuery]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Redirect to traveler mode if not a host
  React.useEffect(() => {
    if (!isHost) {
      router.replace("/(tabs)");
    }
  }, [isHost]);

  // Render item for FlatList
  const renderItem = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={[
        styles.propertyCard,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.white,
          borderColor: isDark
            ? theme.colors.grayPalette[700]
            : theme.colors.grayPalette[200],
        },
      ]}
      onPress={() => router.push(`/host/property/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.propertyImage} />
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.isActive
                ? theme.colors.success[500]
                : theme.colors.error[500],
            },
          ]}
        >
          <Text style={[styles.statusText, { color: theme.colors.white }]}>
            {item.isActive ? t("host.active") : t("host.inactive")}
          </Text>
        </View>
      </View>

      <View style={styles.propertyContent}>
        <View style={styles.propertyHeader}>
          <Text
            style={[
              styles.propertyTitle,
              {
                color: isDark
                  ? theme.colors.white
                  : theme.colors.grayPalette[900],
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.propertyLocation,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>

        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetail}>
            <Ionicons
              name="bed-outline"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
            <Text
              style={[
                styles.propertyDetailText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {item.bedrooms}{" "}
              {item.bedrooms === 1 ? t("common.bedroom") : t("common.bedrooms")}
            </Text>
          </View>

          <View style={styles.propertyDetail}>
            <Ionicons
              name="water-outline"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
            <Text
              style={[
                styles.propertyDetailText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {item.bathrooms}{" "}
              {item.bathrooms === 1
                ? t("common.bathroom")
                : t("common.bathrooms")}
            </Text>
          </View>

          <View style={styles.propertyDetail}>
            <Ionicons name="star" size={16} color={theme.colors.warning[500]} />
            <Text
              style={[
                styles.propertyDetailText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {item.rating} ({item.reviews})
            </Text>
          </View>
        </View>

        <View style={styles.propertyFooter}>
          <View style={styles.propertyPrice}>
            <Text
              style={[
                styles.propertyPriceValue,
                {
                  color: isDark
                    ? theme.colors.white
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {getSymbol()}
              {item.price}
            </Text>
            <Text
              style={[
                styles.propertyPriceLabel,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              / {t("common.night")}
            </Text>
          </View>

          <View style={styles.propertyOccupancy}>
            <Text
              style={[
                styles.occupancyText,
                {
                  color:
                    item.occupancyRate > 70
                      ? theme.colors.success[500]
                      : item.occupancyRate > 30
                      ? theme.colors.warning[500]
                      : theme.colors.error[500],
                },
              ]}
            >
              {item.isActive
                ? `${item.occupancyRate}% ${t("host.occupied")}`
                : t("host.notAvailable")}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isHost) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.white,
            borderColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[500]
          }
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: isDark
                ? theme.colors.white
                : theme.colors.grayPalette[900],
            },
          ]}
          placeholder={t("host.searchProperties")}
          placeholderTextColor={
            isDark
              ? theme.colors.grayPalette[500]
              : theme.colors.grayPalette[400]
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[500]
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "all"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "all" ? "600" : "400",
              },
            ]}
          >
            {t("host.allProperties")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "active" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("active")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "active"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "active" ? "600" : "400",
              },
            ]}
          >
            {t("host.active")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "inactive" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("inactive")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "inactive"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                fontWeight: filter === "inactive" ? "600" : "400",
              },
            ]}
          >
            {t("host.inactive")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results count and Add button */}
      <View style={styles.resultsHeader}>
        <Text
          style={[
            styles.resultsCount,
            {
              color: isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          {filteredProperties.length}{" "}
          {filteredProperties.length === 1
            ? t("host.property")
            : t("host.properties")}
        </Text>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/host/add-property")}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Text style={[styles.addButtonText, { color: theme.colors.white }]}>
            {t("host.addProperty")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Properties list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : filteredProperties.length > 0 ? (
        <FlatList
          data={filteredProperties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="business-outline"
          title={
            searchQuery.length > 0
              ? t("host.noPropertiesFound")
              : t("host.noProperties")
          }
          message={
            searchQuery.length > 0
              ? t("host.noPropertiesFoundDesc")
              : t("host.noPropertiesDesc")
          }
          action={{
            label: t("host.addProperty"),
            onPress: () => router.push("/host/add-property"),
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterTab: {
    marginRight: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterText: {
    fontSize: fontSize.md,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  resultsCount: {
    fontSize: fontSize.sm,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addButtonText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  propertyCard: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#e1e1e1",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  propertyContent: {
    padding: spacing.md,
  },
  propertyHeader: {
    marginBottom: spacing.sm,
  },
  propertyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
  },
  propertyDetails: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  propertyDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  propertyDetailText: {
    fontSize: fontSize.sm,
    marginLeft: 4,
  },
  propertyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  propertyPrice: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  propertyPriceValue: {
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  propertyPriceLabel: {
    fontSize: fontSize.sm,
    marginLeft: 2,
  },
  propertyOccupancy: {},
  occupancyText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
});

export default PropertiesScreen;
