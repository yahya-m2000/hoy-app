/**
 * Main Wishlist screen - shows collections overview
 * Similar to Airbnb's wishlist with collection cards
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Context
import { useTheme } from "@shared/context";
import { useCurrentUser } from "@shared/hooks";

// Components
import { EmptyState } from "@shared/components";
import { CollectionCard, CollectionsModal } from "@modules/properties";

// Services
import {
  wishlistCollectionsService,
  WishlistCollection,
} from "@shared/services/";

// Constants
import { fontSize, fontWeight, spacing } from "@shared/constants";

export default function WishlistIndex() {
  const { theme } = useTheme();
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const loadCollections = useCallback(async () => {
    if (!user) {
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
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [user, loadCollections]);

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
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />{" "}
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Loading your collections...
        </Text>
      </View>
    );
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <EmptyState
          icon="heart-outline"
          title="Log in to view your wishlist"
          message="Save your favorite properties to view them later"
          action={{
            label: "Log In",
            onPress: () => router.push("/auth/login"),
          }}
        />
      </View>
    );
  }

  // Show empty state if no collections
  if (!isLoading && collections.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="heart-outline"
          title="Create your first wishlist"
          message="As you search, tap the heart icon to save your favorite places to a wishlist"
          action={{
            label: "Create Wishlist",
            onPress: handleCreateCollection,
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
          backgroundColor: theme.background,
          paddingTop: insets.top + spacing.xxl,
        },
      ]}
    >
      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.error + "20" },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadCollections}>
            <Text style={[styles.retryText, { color: theme.primary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={collections}
        renderItem={({ item }) => (
          <CollectionCard
            id={item._id}
            name={item.name}
            description={item.description}
            propertyCount={item.properties?.length || 0}
            onPress={(id) => handleCollectionPress(item)}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <CollectionsModal
        visible={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        onCollectionToggle={onCollectionsUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  listContainer: {
    padding: spacing.md,
  },
  row: {
    justifyContent: "space-between",
  },
});
