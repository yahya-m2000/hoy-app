import React from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { Property } from "@core/types/listings.types";
import { formatCurrency } from "@core/utils/data/currency";
import {
  Container,
  Card,
  Text,
  Icon,
  Badge,
  Button,
  Row,
} from "@shared/components";
import { iconSize, spacing } from "src/core/design";

interface PropertyListItemProps {
  property: Property;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function isPriceObject(
  price: any
): price is { amount: number; currency?: string } {
  return (
    price &&
    typeof price === "object" &&
    price !== null &&
    Object.prototype.hasOwnProperty.call(price, "amount")
  );
}

export default function PropertyListItem({
  property,
  onPress,
  onEdit,
  onDelete,
  isDeleting = false,
}: PropertyListItemProps) {
  const primaryImage = property.images?.[0];
  const address = `${property.address.city}, ${property.address.state}`;

  const handleOptionsPress = () => {
    Alert.alert("Property Options", `Options for \"${property.name}\"`, [
      {
        text: "Edit",
        onPress: onEdit,
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const status = property.isActive
    ? { text: "Active", variant: "success" as const }
    : { text: "Inactive", variant: "error" as const };

  return (
    <Container style={{ marginBottom: 16, opacity: isDeleting ? 0.6 : 1 }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        {/* Property Image */}
        <Container style={{ position: "relative" }}>
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
              }}
            />
          ) : (
            <Container
              style={{
                width: "100%",
                height: 180,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="image-outline" size={iconSize.lg} color="#999" />
            </Container>
          )}
          <Container style={{ position: "absolute", top: 8, right: 8 }}>
            <Badge content={status.text} variant={status.variant} size="md" />
          </Container>
        </Container>

        {/* Property Details */}
        <Container>
          <Row justify="space-between" align="center" marginTop={spacing.xs}>
            <Text variant="h6" weight="medium">
              {property.name}
            </Text>
            <TouchableOpacity onPress={handleOptionsPress}>
              <Icon
                name={isDeleting ? "hourglass-outline" : "open-outline"}
                size={iconSize.xs}
                color="primary"
              />
            </TouchableOpacity>
          </Row>
          <Text variant="body" color="textSecondary" numberOfLines={1}>
            {address}
          </Text>
          <Text
            variant="caption"
            color="primary"
            weight="medium"
            style={{ marginBottom: 8 }}
          >
            {property.propertyType.charAt(0).toUpperCase() +
              property.propertyType.slice(1)}
          </Text>

          {/* Property Stats */}
          <Row align="center" gap={16} wrap>
            <Row align="center" gap={4}>
              <Icon name="bed-outline" size={iconSize.xs} color="primary" />
              <Text variant="caption">{property.bedrooms}</Text>
            </Row>
            <Row align="center" gap={4}>
              <Icon name="water-outline" size={iconSize.xs} color="primary" />
              <Text variant="caption">{property.bathrooms}</Text>
            </Row>
            <Row align="center" gap={4}>
              <Icon name="people-outline" size={iconSize.xs} color="primary" />
              <Text variant="caption">{property.maxGuests}</Text>
            </Row>
            {property.rating > 0 && (
              <Row align="center" gap={4}>
                <Icon name="star" size={iconSize.xs} color="primary" />
                <Text variant="caption">{property.rating.toFixed(1)}</Text>
              </Row>
            )}
          </Row>

          {/* Price */}
          <Row align="baseline" gap={4}>
            <Text variant="body" weight="medium" color="primary">
              {typeof property.price === "number"
                ? formatCurrency(property.price, property.currency)
                : isPriceObject(property.price)
                ? formatCurrency(
                    (property.price as { amount: number; currency?: string })
                      .amount,
                    (property.price as { amount: number; currency?: string })
                      .currency || property.currency
                  )
                : "-"}
            </Text>
            <Text variant="caption" color="textSecondary">
              / night
            </Text>
          </Row>
        </Container>
      </TouchableOpacity>
    </Container>
  );
}
