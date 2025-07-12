/**
 * Collection Detail Screen - shows properties in a specific collection
 * Allows users to view and manage properties within a collection
 */

import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, RefreshControl, FlatList, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

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
  Screen,
} from "@shared/components";

// Constants
import { spacing, radius } from "@core/design";

// Types
import type { PropertyType } from "@core/types";

const { width: screenWidth } = Dimensions.get("window");

export default function CollectionDetail() {
  const { theme, isDark } = useTheme();
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collectionName, setCollectionName] = useState<string>("");

  // Calculate card dimensions for responsive grid (same as wishlist index)
  const cardMargin = spacing.md;
  const containerPadding = spacing.md * 2; // padding on both sides
  const cardWidth = (screenWidth - containerPadding - cardMargin) / 2; // 2 columns

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

      setCollectionName(foundCollection.name);

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

  // Render individual property card
  const renderPropertyCard = ({ item }: { item: PropertyType }) => (
    <Container
      style={{
        width: cardWidth,
        marginRight: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <PropertyCard
        {...item}
        _id={item.id || item._id}
        name={item.name || item.title || "Property"}
        price={typeof item.price === "object" ? item.price.amount : item.price}
        onPress={() => handlePropertyPress(item)}
        variant="collection"
      />
    </Container>
  );

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <Screen
        header={{
          title: decodeURIComponent(name || ""),
          left: { icon: "arrow-back-outline", onPress: () => router.back() },
        }}
      >
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              {t("wishlist.loadingCollection")}
            </Text>
          </Container>
        </Container>
      </Screen>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header
          title={decodeURIComponent(name || "")}
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="alert-circle-outline"
            title={t("wishlist.errorLoadingCollection")}
            message={error}
            action={{
              label: t("common.retry"),
              onPress: loadCollectionData,
            }}
          />
        </Container>
      </Container>
    );
  }

  // Show empty collection
  if (properties.length === 0) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header
          title={decodeURIComponent(name || "")}
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title={t("wishlist.noPropertiesSaved")}
            message={t("wishlist.noPropertiesSavedMessage")}
            action={{
              label: t("wishlist.startExploring"),
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
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={decodeURIComponent(name || "")}
        left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Properties Content */}
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
          {/* Properties Section Header */}
          <Container
            marginBottom="lg"
            style={{
              borderRadius: radius.lg,
              paddingVertical: spacing.md,
              marginHorizontal: spacing.xs,
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
                  {t("wishlist.properties")}
                </Text>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  weight="medium"
                >
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"}
                </Text>
              </Container>
            </Container>
          </Container>

          {/* Properties Grid */}
          <Container>
            <FlatList
              data={properties}
              renderItem={renderPropertyCard}
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

      <CollectionsModal
        visible={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        onCollectionToggle={onCollectionsUpdate}
      />
    </Container>
  );
}
