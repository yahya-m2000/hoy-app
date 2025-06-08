/**
 * Host Listings Screen
 * Shows property listings with management tools for hosts
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Components
import { LoadingSpinner } from "@shared/components";

// Context
import { useTheme, useAuth } from "@shared/context";

// Services
import * as hostService from "@shared/services/hostService";

// Types
import { Property } from "@shared/types";

const HostListingsScreen = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.gray[900] : theme.colors.gray[50],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? theme.colors.gray[700]
        : theme.colors.gray[200],
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? theme.white : theme.colors.gray[900],
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    addButtonText: {
      color: theme.white,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },
    listingsList: {
      padding: 16,
    },
    listingCard: {
      backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
    },
    listingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    listingTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? theme.white : theme.colors.gray[900],
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    listingDetails: {
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    detailText: {
      fontSize: 14,
      color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
      marginLeft: 6,
    },
    listingActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
      paddingTop: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? theme.white : theme.colors.gray[900],
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
      textAlign: "center",
      marginBottom: 24,
    },
    createListingButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    createListingButtonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
  });
  const loadListings = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please sign in to view your listings");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await hostService.getHostProperties();
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading listings:", error);
      setError("Failed to load listings. Please try again.");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };
  useEffect(() => {
    loadListings();
  }, [loadListings]);
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          backgroundColor: theme.colors.success + "20",
          color: theme.colors.success,
        };
      case "inactive":
        return {
          backgroundColor: theme.colors.gray[100],
          color: theme.colors.gray[800],
        };
      case "draft":
        return {
          backgroundColor: theme.colors.warning + "20",
          color: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.gray[100],
          color: theme.colors.gray[800],
        };
    }
  };
  const handleEditListing = (listing: Property) => {
    Alert.alert("Edit Listing", `Edit ${listing.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => console.log("Edit listing:", listing._id),
      },
    ]);
  };

  const handleViewAnalytics = (listing: Property) => {
    Alert.alert("Analytics", `View analytics for ${listing.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View",
        onPress: () => console.log("View analytics:", listing._id),
      },
    ]);
  };

  const handleCreateListing = () => {
    Alert.alert("Create Listing", "This will open the listing creation form.", [
      { text: "Cancel", style: "cancel" },
      { text: "Create", onPress: () => console.log("Create new listing") },
    ]);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadListings}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateListing}
        >
          <Ionicons name="add" size={16} color={theme.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="home-outline"
            size={64}
            color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptyDescription}>
            Create your first listing to start hosting on Hoy
          </Text>
          <TouchableOpacity
            style={styles.createListingButton}
            onPress={handleCreateListing}
          >
            <Ionicons name="add" size={20} color={theme.white} />
            <Text style={styles.createListingButtonText}>Create Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listingsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {listings.map((listing) => {
            const statusColors = getStatusColor(listing.status);

            return (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.listingHeader}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusColors.color }]}
                    >
                      {listing.status || "Draft"}
                    </Text>
                  </View>
                </View>

                <View style={styles.listingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={
                        isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                      }
                    />{" "}
                    <Text style={styles.detailText}>
                      {listing.address?.city || "Location not set"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={
                        isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                      }
                    />
                    <Text style={styles.detailText}>
                      {listing.maxGuests || 0} guests
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="cash-outline"
                      size={14}
                      color={
                        isDark ? theme.colors.gray[400] : theme.colors.gray[500]
                      }
                    />{" "}
                    <Text style={styles.detailText}>
                      ${listing.price?.amount || 0}/
                      {listing.price?.period || "night"}
                    </Text>
                  </View>
                </View>

                <View style={styles.listingActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        borderColor: theme.colors.primary,
                        backgroundColor: isDark
                          ? theme.colors.gray[800]
                          : theme.white,
                      },
                    ]}
                    onPress={() => handleEditListing(listing)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        borderColor: isDark
                          ? theme.colors.gray[600]
                          : theme.colors.gray[300],
                        backgroundColor: isDark
                          ? theme.colors.gray[800]
                          : theme.white,
                      },
                    ]}
                    onPress={() => handleViewAnalytics(listing)}
                  >
                    <Ionicons
                      name="analytics-outline"
                      size={16}
                      color={
                        isDark ? theme.colors.gray[300] : theme.colors.gray[600]
                      }
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        {
                          color: isDark
                            ? theme.colors.gray[300]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      Analytics
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default HostListingsScreen;
