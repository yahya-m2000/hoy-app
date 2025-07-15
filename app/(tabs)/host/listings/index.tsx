import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

// Navigation
import { router } from "expo-router";

// Features
import { useProperties } from "@features/host/hooks/useProperties";
import { host } from "@core/api/services";
import { Property as HostProperty } from "@core/types/property.types";
import PropertyListItem from "@features/host/components/listings/PropertyListItem";
import LoadingState from "@features/host/components/listings/LoadingState";
import { Icon, Container, Header } from "@shared/components";
import EmptyState from "@shared/components/feedback/Empty/EmptyState";
import { useTheme } from "@core/hooks";
import { WithSetupCheck } from "@features/host/components/setup";

// Shared Components
import { spacing } from "src/core/design";
import { useTranslation } from "react-i18next";
import PropertyCard from "@features/properties/components/cards/PropertyCard";

export default function ListingsPage() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { properties, loading, error, refreshing, refresh, deleteProperty } =
    useProperties();
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(
    null
  );
  const handlePropertyPress = (property: HostProperty) => {
    router.push({
      pathname: "/(tabs)/host/listings/details/",
      params: { id: property._id },
    });
  };

  const handleEditProperty = (property: HostProperty) => {
    router.push({
      pathname: "/(tabs)/host/listings/add/",
      params: {
        mode: "edit",
        propertyId: property._id,
      },
    });
  };

  const HeaderAddButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/host/listings/add/")}
      style={{ padding: 8 }}
    >
      <Icon
        name="add"
        size={24}
        color={isDark ? theme.white : theme.colors.gray[900]}
      />
    </TouchableOpacity>
  );

  const handleDeleteProperty = (property: HostProperty) => {
    Alert.alert(
      "Delete Property",
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPropertyId(property._id);
              await deleteProperty(property._id);
              Alert.alert("Success", "Property deleted successfully");
            } catch {
              Alert.alert(
                "Error",
                "Failed to delete property. Please try again."
              );
            } finally {
              setDeletingPropertyId(null);
            }
          },
        },
      ]
    );
  };

  const handleTogglePropertyStatus = async (property: HostProperty) => {
    const action = property.isActive
      ? t("property.options.deactivate")
      : t("property.options.activate");
    const newStatus = property.isActive ? "inactive" : "active";

    try {
      setDeletingPropertyId(property._id);
      await host.HostPropertyService.updateStatus(property._id, newStatus);
      Alert.alert(
        t("common.success"),
        t("property.options.statusUpdated", { action })
      );
      await refresh();
    } catch (err) {
      Alert.alert(t("common.error"), t("property.options.statusUpdateFailed"));
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const handleAddProperty = () => {
    router.push("/(tabs)/host/listings/add/");
  };

  const renderProperty = ({ item }: { item: HostProperty }) => (
    <PropertyCard
      _id={item._id}
      name={item.name}
      address={item.address}
      price={
        typeof item.price === "number"
          ? item.price
          : (item.price as any)?.amount || 0
      }
      currency={item.currency}
      images={item.images}
      rating={item.rating}
      reviewCount={item.reviewCount}
      propertyType={item.propertyType}
      hostType={item.hostType}
      isHost={true}
      onPress={() => handlePropertyPress(item)}
      onEdit={() => handleEditProperty(item)}
      onDelete={() => handleDeleteProperty(item)}
      onToggleStatus={() => handleTogglePropertyStatus(item)}
      isDeleting={deletingPropertyId === item._id}
      hostStatus={
        item.status === "draft"
          ? "draft"
          : item.isActive
          ? "active"
          : "inactive"
      }
    />
  );
  if (loading) {
    return <LoadingState />;
  }

  return (
    <WithSetupCheck
      promptVariant="card"
      promptTitle={t("host.setup.listingsPromptTitle")}
      promptMessage={t("host.setup.listingsPromptMessage")}
    >
      <Container flex={1} backgroundColor="background">
        <Header
          title={t("navigation.listings")}
          rightIcon="add"
          onRightPress={handleAddProperty}
        />
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContainer,
            properties.length === 0 && styles.emptyContainer,
            { paddingBottom: 100 },
            properties.length === 0 && {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={() => (
            <EmptyState
              icon="home-outline"
              title={t("host.listings.emptyTitle")}
              message={error ? error : t("host.listings.emptyMessage")}
              action={{
                label: t("host.listings.addProperty"),
                onPress: handleAddProperty,
              }}
            />
          )}
        />
      </Container>
    </WithSetupCheck>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
