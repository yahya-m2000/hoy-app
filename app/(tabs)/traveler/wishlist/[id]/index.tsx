/**
 * Collection Detail Screen - shows properties in a specific collection
 * Allows users to view and manage properties within a collection
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Context
import { useTheme, useAuth } from "@shared/context";
import { useCurrentUser } from "@shared/hooks/";

// Components
import { EmptyState } from "@shared/components";
import { PropertyCard, CollectionsModal } from "@modules/properties";

// Services
import {
  wishlistCollectionsService,
  WishlistCollection,
  fetchPropertyById,
} from "@shared/services";

// Constants
import { fontSize, fontWeight, spacing } from "@shared/constants";

// Types
import type { PropertyType } from "@shared/types/";

export default function CollectionDetail() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  const loadCollectionData = useCallback(async () => {
    if (!user || !id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // Get collection details
      const collectionsResponse =
        await wishlistCollectionsService.getCollections();
      const foundCollection = collectionsResponse.find(
        (col: WishlistCollection) => col._id === id
      );
      if (!foundCollection) {
        setError("Collection not found");
        setIsLoading(false);
        return;
      }

      // Load all properties in this collection
      const propertyPromises = foundCollection.properties.map(
        async (propertyId: string) => {
          try {
            return await fetchPropertyById(propertyId);
          } catch (error) {
            console.error(`Failed to load property ${propertyId}:`, error);
            return null;
          }
        }
      );

      const loadedProperties = await Promise.all(propertyPromises);
      const validProperties = loadedProperties.filter(
        Boolean
      ) as PropertyType[];
      setProperties(validProperties);
    } catch (err) {
      console.error("Error loading collection:", err);
      setError("Failed to load collection");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, id]);
  useEffect(() => {
    loadCollectionData();
  }, [loadCollectionData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCollectionData();
  };
  const handlePropertyPress = (property: PropertyType) => {
    console.log(JSON.stringify(property));
    router.push({
      pathname: "/(tabs)/traveler/wishlist/property/[id]",
      params: {
        property: JSON.stringify(property),
        returnTo: "/(tabs)/traveler/wishlist",
      },
    });
  }; // Uncomment if needed for future use
  // const handleManageCollection = () => {
  //   setShowCollectionsModal(true);
  // };

  const onCollectionsUpdate = () => {
    loadCollectionData();
  };

  // Update route params to include property count
  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      router.setParams({
        propertyCount: properties.length.toString(),
      });
    }
  }, [properties.length, isLoading, isRefreshing, router]);

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Loading collection...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error"
          message={error}
          action={{
            label: "Go Back",
            onPress: () => router.back(),
          }}
        />
      </View>
    );
  }

  // Show empty collection
  if (properties.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="heart-outline"
          title="No properties saved"
          message="Start exploring to find and save properties to this collection"
          action={{
            label: "Start exploring",
            onPress: () => router.push("/traveler/search"),
          }}
        />
        <CollectionsModal
          visible={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          onCollectionToggle={onCollectionsUpdate}
        />
      </View>
    );
  }
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          paddingTop: insets.top + spacing.xl,
        },
      ]}
    >
      <ScrollView>
        {properties &&
          properties.map((property, i) => {
            if (!property || !property._id) {
              return null;
            }
            return (
              <PropertyCard
                key={i}
                {...property}
                _id={property.id || property._id}
                name={property.name || property.title}
                price={
                  typeof property.price === "object"
                    ? property.price.amount
                    : property.price
                }
                onPress={() => handlePropertyPress(property)}
              />
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
  },
  headerButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  headerSpacer: {
    width: 32,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  collectionInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  propertyCount: {
    fontSize: fontSize.sm,
  },
  listContainer: {
    padding: spacing.md,
  },
});
