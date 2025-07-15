import React, { useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity } from "react-native";

// Core
import { useTheme } from "@core/hooks";
import { spacing, iconSize } from "@core/design";

// Features
import { useHostProperties } from "@features/properties/hooks";
import { Property as APIProperty } from "@core/types/property.types";
import { useProperty } from "@features/calendar/hooks/useProperty";

// Shared
import {
  Container,
  Text,
  Icon,
  Button,
  PropertyImage,
} from "@shared/components";
import { Screen } from "@shared/components/layout/Screen";
import { EmptyState } from "@shared/components/feedback";

// Local Property interface
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  images: string[];
  isActive: boolean;
  price: number;
  weekdayPrice: number;
  weekendPrice: number;
  currency: string;
}

// Transform API Property to Calendar Property interface
const transformAPIProperty = (apiProperty: APIProperty): Property => {
  return {
    id: apiProperty._id,
    name: apiProperty.name,
    address:
      `${apiProperty.address?.street || ""} ${
        apiProperty.address?.city || ""
      } ${apiProperty.address?.state || ""}`.trim() || "Address not available",
    type: apiProperty.type,
    images: apiProperty.images || [],
    isActive: apiProperty.isActive,
    price:
      typeof apiProperty.price === "object"
        ? apiProperty.price.amount
        : apiProperty.price || 0,
    weekdayPrice:
      apiProperty.weekdayPrice ||
      (typeof apiProperty.price === "object"
        ? apiProperty.price.amount
        : apiProperty.price) ||
      0,
    weekendPrice:
      apiProperty.weekendPrice ||
      (typeof apiProperty.price === "object"
        ? apiProperty.price.amount
        : apiProperty.price) ||
      0,
    currency:
      apiProperty.currency ||
      (typeof apiProperty.price === "object"
        ? apiProperty.price.currency
        : "USD"),
  };
};

export default function PropertySelectionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { properties: apiProperties, loading: isLoading } = useHostProperties();
  const { setSelectedProperty } = useProperty();

  // Transform API properties to calendar properties - only active properties
  const properties = apiProperties
    .filter((property) => property.isActive)
    .map(transformAPIProperty);

  console.log("🏠 PropertySelectionScreen: Property data", {
    propertiesCount: properties.length,
    properties: properties.map((p: Property) => ({ id: p.id, name: p.name })),
  });

  // Handle close button press
  const handleClosePress = useCallback(() => {
    router.back();
  }, [router]);

  // Handle property selection
  const handlePropertySelect = useCallback(
    (property: Property) => {
      // Set the selected property in the context and go back
      setSelectedProperty(property);
      router.back();
    },
    [setSelectedProperty, router]
  );

  // Render property item
  const renderPropertyItem = useCallback(
    ({ item }: { item: Property }) => (
      <TouchableOpacity onPress={() => handlePropertySelect(item)}>
        <Container flexDirection="row" alignItems="center" marginVertical="sm">
          <PropertyImage uri={item.images[0]} size="sm" />
          <Text marginHorizontal="sm">{item.name}</Text>
          <Icon
            name="chevron-forward"
            size={iconSize.xs}
            color={theme.text.primary || "#007AFF"}
          />
        </Container>
      </TouchableOpacity>
    ),
    [handlePropertySelect, theme]
  );

  return (
    <Screen
      header={{
        title: t("calendar.selectProperty"),
        showDivider: false,
        left: {
          children: (
            <TouchableOpacity onPress={handleClosePress}>
              <Icon
                name="chevron-back-outline"
                size={iconSize.md}
                color={theme.text.primary || "#007AFF"}
              />
            </TouchableOpacity>
          ),
        },
      }}
    >
      <Container
        flex={1}
        paddingHorizontal="lg"
        justifyContent="center"
        alignItems="center"
      >
        {properties.length === 0 ? (
          <EmptyState
            icon="home-outline"
            title={t("calendar.noProperties")}
            message={t("calendar.addPropertiesToStart")}
          />
        ) : (
          <FlatList
            data={properties}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          />
        )}
      </Container>
    </Screen>
  );
}
