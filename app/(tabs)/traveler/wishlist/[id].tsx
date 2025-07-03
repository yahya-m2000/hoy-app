/**
 * Collection Detail Screen - shows properties in a specific collection
 * Allows users to view and manage properties within a collection
 */

import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Core
import { useTheme } from "@core/hooks";

// Features
import { useCurrentUser } from "@features/user/hooks";
import { CollectionsModal } from "@features/properties/modals";
import { PropertyCard } from "src/features/properties/components/cards/PropertyCard";
import {
  WishlistService,
  type WishlistCollection,
} from "@core/api/services/wishlist";
import { PropertyDetailsService } from "@core/api/services/property";

// Shared
import {
  Container,
  Text,
  EmptyState,
  LoadingSpinner,
  Header,
} from "@shared/components";

// Types
import type { PropertyType } from "@core/types";

export default function CollectionDetail() {
  const { theme, isDark } = useTheme();
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string; name: string }>();

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
      const collectionsResponse = await WishlistService.getCollections();
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
            return await PropertyDetailsService.getPropertyById(propertyId);
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
        id: property._id,
        property: JSON.stringify(property),
        collectionId: id, // Pass the collection ID for proper back navigation
        returnTo: `/(tabs)/traveler/wishlist/${id}`,
      },
    });
  };

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
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Header
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <LoadingSpinner size="large" />
        <Container marginTop="md">
          <Text
            variant="body"
            color="secondary"
            style={{ textAlign: "center" }}
          >
            Loading collection...
          </Text>
        </Container>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Header
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <EmptyState
          icon="alert-circle-outline"
          title="Error"
          message={error}
          action={{
            label: "Go Back",
            onPress: () => router.back(),
          }}
        />
      </Container>
    );
  }

  // Show empty collection
  if (properties.length === 0) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title="No properties saved"
            message="Start exploring to find and save properties to this collection"
            action={{
              label: "Start exploring",
              onPress: () => router.push("/traveler/search"),
            }}
          />
        </Container>
        <CollectionsModal
          visible={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          onCollectionToggle={onCollectionsUpdate}
        />
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor="background">
      <Header
        left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
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
                variant="fullWidth"
              />
            );
          })}
      </ScrollView>

      <CollectionsModal
        visible={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        onCollectionToggle={onCollectionsUpdate}
      />
    </Container>
  );
}
