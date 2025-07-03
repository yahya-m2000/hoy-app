import React from "react";
import { ScrollView, Image, View, TouchableOpacity } from "react-native";

// Navigation
import { router, useLocalSearchParams } from "expo-router";

// External
import { Ionicons } from "@expo/vector-icons";

// Core
import { useTheme } from "@core/hooks";
import { formatCurrency } from "@core/utils/data/currency";

// Shared Components
import {
  Container,
  Text,
  Button,
  Card,
  Icon,
  Badge,
  Row,
  Pill,
  Header,
} from "@shared/components";

// Features
import { useProperty } from "@features/host/hooks/useProperties";
import LoadingState from "@features/host/components/listings/LoadingState";

const DetailItem = ({ icon, label, value }: any) => (
  <Row
    style={{
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <Row>
      <Icon name={icon} size={20} color="textSecondary" />
      <Text style={{ marginLeft: 12 }} color="textSecondary">
        {label}
      </Text>
    </Row>
    <Text weight="medium">{value}</Text>
  </Row>
);

const Section = ({ title, children }: any) => (
  <Card style={{ marginBottom: 16 }}>
    <Text variant="h5" weight="bold" style={{ marginBottom: 12 }}>
      {title}
    </Text>
    {children}
  </Card>
);

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading, error } = useProperty(id!);
  const { theme, isDark } = useTheme();

  const handleEdit = () => {
    if (property) {
      router.push({
        pathname: "/(tabs)/host/listings/add-property",
        params: {
          mode: "edit",
          propertyId: property._id,
        },
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !property) {
    return (
      <Container
        flex={1}
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Icon name="alert-circle-outline" size={64} color="error" />
        <Text
          variant="h4"
          weight="bold"
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          Property not found
        </Text>
        <Text
          color="textSecondary"
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          {error || "The property you're looking for could not be found."}
        </Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </Container>
    );
  }

  const primaryImage = property.images?.[0];
  const address = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.postalCode}`;
  const guestAccessText =
    property.guestAccessType
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A";
  const hostTypeText =
    property.hostType?.charAt(0).toUpperCase() + property.hostType?.slice(1) ||
    "N/A";

  const getStatus = () => {
    if (property.status === "draft") {
      return { text: "Draft", color: "warning" as const };
    }
    if (property.isActive) {
      return { text: "Active", color: "success" as const };
    }
    return { text: "Inactive", color: "error" as const };
  };
  const status = getStatus();

  return (
    <Container flex={1} backgroundColor="background">
      <Header title="Property Details" />
      <ScrollView>
        <Container>
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={{ width: "100%", height: 250 }}
            />
          ) : (
            <Container
              height={250}
              backgroundColor="surface"
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <Icon name="image-outline" size={64} color="textSecondary" />
            </Container>
          )}

          <View style={{ position: "absolute", top: 16, right: 16 }}>
            <Badge content={status.text} variant={status.color} size="lg" />
          </View>
        </Container>

        <Container style={{ padding: 16 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Text variant="h3" weight="bold" style={{ flex: 1 }}>
              {property.name}
            </Text>
            <Button
              title="Edit"
              variant="outline"
              icon="create-outline"
              onPress={handleEdit}
            />
          </Row>
          <Text variant="body" color="textSecondary" style={{ marginTop: 4 }}>
            {guestAccessText} hosted by a {hostTypeText}
          </Text>
          <Row style={{ marginTop: 12 }}>
            <Icon name="location-outline" size={16} color="textSecondary" />
            <Text
              variant="caption"
              color="textSecondary"
              style={{ marginLeft: 4 }}
            >
              {address}
            </Text>
          </Row>

          <Row style={{ marginTop: 16, marginHorizontal: -4 }}>
            <Card style={{ flex: 1, padding: 12, marginHorizontal: 4 }}>
              <Icon name="bed-outline" size={24} color="primary" />
              <Text variant="h5" weight="bold" style={{ marginTop: 8 }}>
                {property.bedrooms}
              </Text>
              <Text variant="caption">Bedrooms</Text>
            </Card>
            <Card style={{ flex: 1, padding: 12, marginHorizontal: 4 }}>
              <Icon name="water-outline" size={24} color="primary" />
              <Text variant="h5" weight="bold" style={{ marginTop: 8 }}>
                {property.bathrooms}
              </Text>
              <Text variant="caption">Bathrooms</Text>
            </Card>
            <Card style={{ flex: 1, padding: 12, marginHorizontal: 4 }}>
              <Icon name="people-outline" size={24} color="primary" />
              <Text variant="h5" weight="bold" style={{ marginTop: 8 }}>
                {property.maxGuests}
              </Text>
              <Text variant="caption">Max Guests</Text>
            </Card>
            {property.rating > 0 && (
              <Card style={{ flex: 1, padding: 12, marginHorizontal: 4 }}>
                <Icon name="star" size={24} color={theme.warning} />
                <Text variant="h5" weight="bold" style={{ marginTop: 8 }}>
                  {property.rating.toFixed(1)}
                </Text>
                <Text variant="caption">Rating</Text>
              </Card>
            )}
          </Row>
        </Container>

        <Container style={{ paddingHorizontal: 16 }}>
          <Section title="Pricing">
            <Row style={{ justifyContent: "space-around" }}>
              <Container style={{ alignItems: "center" }}>
                <Text variant="caption">Weekday</Text>
                <Text variant="h4" weight="bold">
                  {formatCurrency(property.weekdayPrice, property.currency)}
                </Text>
                <Text variant="caption">per night</Text>
              </Container>
              <Container style={{ alignItems: "center" }}>
                <Text variant="caption">Weekend</Text>
                <Text variant="h4" weight="bold">
                  {formatCurrency(property.weekendPrice, property.currency)}
                </Text>
                <Text variant="caption">per night</Text>
              </Container>
            </Row>
          </Section>

          {property.description && (
            <Section title="Description">
              <Text style={{ lineHeight: 24 }}>{property.description}</Text>
            </Section>
          )}

          {property.amenities && property.amenities.length > 0 && (
            <Section title="Amenities">
              <Row style={{ flexWrap: "wrap" }}>
                {property.amenities.map((amenity: string, index: number) => (
                  <Pill
                    key={index}
                    label={amenity}
                    style={{ marginRight: 8, marginBottom: 8 }}
                  />
                ))}
              </Row>
            </Section>
          )}

          {property.tags && property.tags.length > 0 && (
            <Section title="Property Tags">
              <Row style={{ flexWrap: "wrap" }}>
                {property.tags.map((tag: string, index: number) => (
                  <Pill
                    key={index}
                    label={tag}
                    variant="info"
                    style={{ marginRight: 8, marginBottom: 8 }}
                  />
                ))}
              </Row>
            </Section>
          )}

          <Section title="Property Details">
            <DetailItem
              icon="key-outline"
              label="Guest Access"
              value={guestAccessText}
            />
            <DetailItem
              icon="business-outline"
              label="Host Type"
              value={hostTypeText}
            />
            <DetailItem icon="bed-outline" label="Beds" value={property.beds} />
            <DetailItem
              icon="chatbox-ellipses-outline"
              label="Reviews"
              value={property.reviewCount}
            />
            <DetailItem
              icon="star-outline"
              label="Featured"
              value={property.isFeatured ? "Yes" : "No"}
            />
          </Section>

          {property.discounts && (
            <Section title="Active Discounts">
              {property.discounts.newListingPromo && (
                <DetailItem
                  icon="pricetag-outline"
                  label="New Listing Promo"
                  value="20% off first 3 bookings"
                />
              )}
              {property.discounts.lastMinuteDiscount && (
                <DetailItem
                  icon="time-outline"
                  label="Last-Minute Discount"
                  value="Active for bookings within 24h"
                />
              )}
            </Section>
          )}

          {property.safetyFeatures && (
            <Section title="Safety & Property">
              {Object.entries(property.safetyFeatures).map(([key, value]) => {
                if (typeof value === "boolean" && value) {
                  return (
                    <DetailItem
                      key={key}
                      icon="shield-checkmark-outline"
                      label={key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                      value="Yes"
                    />
                  );
                }
                if (typeof value === "object" && (value as any)?.exterior) {
                  return (
                    <DetailItem
                      key={key}
                      icon="videocam-outline"
                      label="Security Cameras"
                      value="Exterior"
                    />
                  );
                }
                return null;
              })}
            </Section>
          )}
        </Container>
      </ScrollView>
    </Container>
  );
}
