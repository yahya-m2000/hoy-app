/**
 * Main Wishlist screen - shows collections overview
 * Similar to Airbnb's wishlist with collection cards
 */

import React, { useState, useEffect, useCallback } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";

// Context
import { useTheme } from "@core/hooks";
import { useAuth } from "@core/context";

// Base Components
import {
  Container,
  Text,
  Header,
  Button,
  EmptyState,
  LoadingSpinner,
} from "@shared/components";

// Module Components
import { CollectionsModal, CollectionCard } from "src/features/properties";

// Services
import {
  wishlistCollectionsService,
  WishlistCollection,
} from "@core/api/services/wishlist";

export default function WishlistIndex() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await wishlistCollectionsService.getCollections();
      setCollections(response || []);
    } catch (err) {
      console.error("Error loading collections:", err);
      setError("Failed to load collections");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCollections();
  }, [isAuthenticated, loadCollections]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCollections();
  };

  const handleCollectionPress = (collection: WishlistCollection) => {
    router.push(
      `/traveler/wishlist/${collection._id}?name=${encodeURIComponent(
        collection.name
      )}`
    );
  };

  const handleCreateCollection = () => {
    setShowCollectionsModal(true);
  };

  const onCollectionsUpdate = () => {
    loadCollections();
  };

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Wishlist" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              Loading your collections...
            </Text>
          </Container>
        </Container>
      </Container>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Wishlist" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title="Log in to view your wishlist"
            message="Save your favorite properties to view them later"
            action={{
              label: "Log In",
              onPress: () => router.push("/auth/login"),
            }}
          />
        </Container>
      </Container>
    );
  }

  // Show empty state if no collections
  if (!isLoading && collections.length === 0) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Wishlist" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title="Create your first wishlist"
            message="As you search, tap the heart icon to save your favorite places to a wishlist"
            action={{
              label: "Create Wishlist",
              onPress: handleCreateCollection,
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
      <Header title="Wishlist" />

      {/* Error Banner */}
      {error && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            padding: 16,
            backgroundColor: `${theme.colors.error}20`,
            borderRadius: 8,
          }}
        >
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <View style={{ flex: 1 }}>
              <Text variant="body" color="error">
                {error}
              </Text>
            </View>
            <Button
              title="Retry"
              variant="ghost"
              size="small"
              onPress={loadCollections}
            />
          </Container>
        </View>
      )}

      {/* Collections Grid */}
      <Container flex={1} paddingHorizontal="md">
        <FlatList
          data={collections}
          renderItem={({ item }) => (
            <Container width="48%" marginBottom="md">
              <CollectionCard
                id={item._id}
                name={item.name}
                description={item.description}
                propertyCount={item.properties?.length || 0}
                onPress={(id) => handleCollectionPress(item)}
              />
            </Container>
          )}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        />
      </Container>

      {/* Collections Modal */}
      <CollectionsModal
        visible={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        onCollectionToggle={onCollectionsUpdate}
      />
    </Container>
  );
}
