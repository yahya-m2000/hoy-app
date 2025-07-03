/**
 * Collections List Component
 * Manages the list of collections in a 2-per-row grid layout
 */

import React from "react";
import { ScrollView, View } from "react-native";
import { WishlistCollection } from "@core/api/services";
import { Container, Text, Button } from "@shared/components";
import CollectionCard from "./CollectionsCard";
import { spacing } from "@core/design";

interface CollectionsListProps {
  collections: WishlistCollection[];
  propertyId?: string;
  loading: boolean;
  onCollectionPress: (collection: WishlistCollection) => void;
  onCreatePress: () => void;
}

export const CollectionsList: React.FC<CollectionsListProps> = React.memo(
  ({ collections, propertyId, loading, onCollectionPress, onCreatePress }) => {
    if (loading) {
      return (
        <Container flex={1} justifyContent="center" alignItems="center">
          <Text variant="body" color="secondary">
            Loading collections...
          </Text>
        </Container>
      );
    }

    // Group collections into rows of 2
    const groupedCollections = [];
    for (let i = 0; i < collections.length; i += 2) {
      groupedCollections.push(collections.slice(i, i + 2));
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl, // Extra padding to ensure content doesn't get cut off by bottom button
          flexGrow: 1, // Ensure ScrollView content grows to fill available space
        }}
        nestedScrollEnabled={true}
      >
        {/* Show message when no collections exist */}
        {collections.length === 0 ? (
          <Container
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingVertical="xl"
          >
            <Container marginBottom="lg">
              <Text variant="body" color="secondary" align="center">
                You don&apos;t have any wishlists yet.{"\n"}Create your first
                one to get started!
              </Text>
            </Container>
            <Button
              onPress={onCreatePress}
              title="Create a Wishlist"
              variant="outline"
            />
          </Container>
        ) : (
          <Container>
            {/* Collections Grid */}
            {groupedCollections.map((row, rowIndex) => (
              <Container
                key={rowIndex}
                flexDirection="row"
                justifyContent="space-between"
                marginBottom="md"
              >
                {row.map((collection) => (
                  <CollectionCard
                    key={collection._id}
                    id={collection._id}
                    name={collection.name}
                    description={collection.description}
                    propertyCount={collection.properties?.length || 0}
                    onPress={() => onCollectionPress(collection)}
                    variant="collection"
                  />
                ))}
                {/* Fill empty space if odd number of items in last row */}
                {row.length === 1 && (
                  <View style={{ flex: 1, margin: spacing.xs }} />
                )}
              </Container>
            ))}
          </Container>
        )}

        {/* Reduced extra padding since modal is now content-sized */}
        <View style={{ height: spacing.md }} />
      </ScrollView>
    );
  }
);

CollectionsList.displayName = "CollectionsList";
