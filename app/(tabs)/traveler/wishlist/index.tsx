/**
 * Main Wishlist screen - shows collections overview
 * Similar to Airbnb's wishlist with collection cards
 */

import React, { useState, useEffect, useCallback } from "react";
import { RefreshControl, ScrollView, FlatList, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

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

// Constants
import { spacing, radius } from "@core/design";

const { width: screenWidth } = Dimensions.get("window");

export default function WishlistIndex() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Calculate card dimensions for responsive grid (same as BookingsSection)
  const cardMargin = spacing.md;
  const containerPadding = spacing.md * 2; // padding on both sides
  const cardWidth = (screenWidth - containerPadding - cardMargin) / 2; // 2 columns

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

  // Render individual collection card (exactly like BookingsSection)
  const renderCollectionCard = ({ item }: { item: WishlistCollection }) => (
    <Container
      style={{
        width: cardWidth,
        marginRight: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <CollectionCard
        id={item._id}
        name={item.name}
        description={item.description}
        propertyCount={item.properties?.length || 0}
        onPress={(id) => handleCollectionPress(item)}
      />
    </Container>
  );

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title={t("wishlist.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              {t("wishlist.loadingCollections")}
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
        <Header title={t("wishlist.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title={t("wishlist.signInToViewWishlist")}
            message={t("wishlist.signInToViewWishlistMessage")}
            action={{
              label: t("auth.signIn"),
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
        <Header title={t("wishlist.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title={t("wishlist.createFirstWishlist")}
            message={t("wishlist.createFirstWishlistMessage")}
            action={{
              label: t("wishlist.createWishlist"),
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
    <Container flex={1} backgroundColor={theme.background}>
      <Header title={t("wishlist.title")} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Error Banner */}
      {error && (
        <Container
          marginHorizontal="md"
          marginTop="md"
          padding="md"
          backgroundColor="error"
          borderRadius="md"
          style={{ opacity: 0.1 }}
        >
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Container flex={1}>
              <Text variant="body" color="error">
                {error}
              </Text>
            </Container>
            <Button
              title={t("wishlist.retry")}
              variant="ghost"
              size="small"
              onPress={loadCollections}
            />
          </Container>
        </Container>
      )}

      {/* Collections Content */}
      <Container flex={1}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={isDark ? theme.white : theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {/* Collections Section Header */}
          <Container
            marginBottom="lg"
            style={{
              borderRadius: radius.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Container
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Container>
                <Text
                  variant="h6"
                  weight="bold"
                  color={theme.text.primary}
                  style={{ marginBottom: 2 }}
                >
                  {t("wishlist.collections")}
                </Text>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  weight="medium"
                >
                  {collections.length}{" "}
                  {collections.length === 1 ? "collection" : "collections"}
                </Text>
              </Container>
            </Container>
          </Container>

          {/* Collections Grid */}
          <Container>
            <FlatList
              data={collections}
              renderItem={renderCollectionCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Disable scroll since this is inside a ScrollView
              ItemSeparatorComponent={() => (
                <Container height={spacing.sm}>
                  <></>
                </Container>
              )}
              contentContainerStyle={{
                paddingBottom: spacing.md,
              }}
            />
          </Container>
        </ScrollView>
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
