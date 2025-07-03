/**
 * Booking Details Screen
 * Displays comprehensive booking information with actions
 */

import React from "react";
import {
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LinkingExpo from "expo-linking";
import { useTranslation } from "react-i18next";

// Context and hooks
import { useToast } from "@core/context";
import { useTheme } from "@core/hooks";
import { useBookingDetails } from "@features/booking/hooks";

// Components
import {
  Container,
  LoadingSpinner,
  EmptyState,
  Text,
  Button,
  Section,
  Header,
  Icon,
  BookingStatusBadge,
} from "@shared/components";

import { PropertyImageContainer } from "src/features/properties/components/details";

// Utils
import {
  formatDate,
  formatCurrency,
} from "@core/utils/data/formatting/data-formatters";
import { iconSize } from "@core/design";

export default function BookingDetailsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useBookingDetails(id || "");

  // Handle calendar actions
  const handleAddToCalendar = () => {
    if (!booking) return;
    const property = booking.propertyId as any;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const title = t("bookings.calendarTitle", {
      property: property?.name || t("bookings.property"),
    });
    const details = t("bookings.calendarDetails", {
      checkIn: formatDate(checkInDate, "long"),
      checkOut: formatDate(checkOutDate, "long"),
      guests: booking.guests.adults + (booking.guests.children || 0),
    });
    if (Platform.OS === "ios") {
      // Use Apple Calendar
      const startDate =
        checkInDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate =
        checkOutDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const appleCalUrl = `calshow:${checkInDate.getTime() / 1000}`;
      LinkingExpo.openURL(appleCalUrl).catch(() => {
        showToast({ message: t("bookings.calendarError"), type: "error" });
      });
    } else {
      // Use Google Calendar
      const startDate =
        checkInDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate =
        checkOutDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;
      LinkingExpo.openURL(calendarUrl).catch(() => {
        showToast({ message: t("bookings.calendarError"), type: "error" });
      });
    }
  };

  // Handle directions
  const handleGetDirections = () => {
    const property = booking?.propertyId as any;
    if (!property?.coordinates) {
      showToast({ message: t("bookings.locationError"), type: "error" });
      return;
    }
    const { latitude, longitude } = property.coordinates;
    let url = "";
    if (Platform.OS === "ios") {
      // Apple Maps
      url = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    } else {
      // Google Maps
      url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
    }
    LinkingExpo.openURL(url).catch(() => {
      showToast({ message: t("bookings.mapsError"), type: "error" });
    });
  };

  // Handle contact host
  const handleContactHost = () => {
    const property = booking?.propertyId as any;
    const phone = property?.host?.phoneNumber || booking.contactInfo?.phone;
    if (!phone) {
      showToast({ message: t("bookings.whatsappError"), type: "error" });
      return;
    }
    // WhatsApp deep link
    const url = `https://wa.me/${phone}`;
    LinkingExpo.openURL(url).catch(() => {
      showToast({ message: t("bookings.whatsappError"), type: "error" });
    });
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        {
          text: "No, Keep Booking",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            showToast({
              message: "Booking cancellation feature coming soon",
              type: "info",
            });
          },
        },
      ]
    );
  };

  // Handle property navigation
  const handleViewProperty = () => {
    if (!booking?.propertyId) return;

    router.push({
      pathname: "/(tabs)/traveler/bookings/property/[id]",
      params: {
        property: JSON.stringify(booking.propertyId),
        returnTo: `/(tabs)/traveler/bookings/${id}`,
      },
    });
  };

  // Calculate days
  const getDaysCount = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Check if booking can be cancelled
  const canCancelBooking = () => {
    if (!booking) return false;
    return booking.status === "confirmed" || booking.status === "pending";
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !booking) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Booking Not Found"
        message="Unable to load booking details. Please try again."
        action={{
          label: "Retry",
          onPress: () => refetch(),
        }}
      />
    );
  }

  const property = booking.propertyId as any; // Type cast since backend returns populated property
  const daysCount = getDaysCount();

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={t("bookings.detailsTitle")}
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Information */}
        {property && (
          <Container marginBottom="lg">
            <Section>
              <TouchableOpacity
                onPress={handleViewProperty}
                activeOpacity={0.7}
              >
                <Container
                  padding="md"
                  borderRadius="md"
                  backgroundColor="rgba(0,0,0,0.02)"
                >
                  <Container flexDirection="row" alignItems="center">
                    <Container width={60} height={60} marginRight="md">
                      <PropertyImageContainer
                        images={property.images}
                        containerStyle={{ borderRadius: 8 }}
                        variant="small"
                      />
                    </Container>
                    <Container flex={1}>
                      <Text variant="body" weight="semibold" numberOfLines={2}>
                        {property.name}
                      </Text>
                      <Container marginTop="xs">
                        <Text
                          variant="caption"
                          color={theme.colors.gray[600]}
                          numberOfLines={1}
                        >
                          {property.propertyType.charAt(0).toUpperCase() +
                            property.propertyType.slice(1)}
                          • {property.address?.city}, {property.address?.state}
                        </Text>
                      </Container>
                      <Container
                        flexDirection="row"
                        alignItems="center"
                        marginTop="xs"
                      >
                        <Icon
                          name="star"
                          size={iconSize.xs}
                          color={theme.colors.primary}
                        />
                        <Container marginLeft="xs">
                          <Text
                            variant="caption"
                            color={theme.colors.gray[600]}
                          >
                            {property.rating?.toFixed(1) || "New"}
                            {property.reviewCount
                              ? ` (${property.reviewCount})`
                              : ""}
                          </Text>
                        </Container>
                      </Container>
                    </Container>
                    <Icon
                      name="chevron-forward"
                      size={iconSize.sm}
                      color={theme.colors.gray[400]}
                    />
                  </Container>
                </Container>
              </TouchableOpacity>
            </Section>
          </Container>
        )}

        {/* Booking Status */}
        <Container marginBottom="lg">
          <Section title={t("bookings.statusTitle")}>
            <Container flexDirection="row" style={{ gap: 16 }}>
              <Container flex={1}>
                <Container marginBottom="xs">
                  <Text variant="caption" color={theme.colors.gray[600]}>
                    Booking
                  </Text>
                </Container>
                <BookingStatusBadge
                  status={booking.status}
                  type="booking"
                  size="medium"
                />
              </Container>
              <Container flex={1}>
                <Container marginBottom="xs">
                  <Text variant="caption" color={theme.colors.gray[600]}>
                    Payment Status
                  </Text>
                </Container>
                <BookingStatusBadge
                  status={
                    [
                      "pending",
                      "confirmed",
                      "cancelled",
                      "completed",
                      "in_progress",
                      "refunded",
                      "disputed",
                      "paid",
                      "partial",
                      "failed",
                    ].includes(booking.paymentStatus)
                      ? booking.paymentStatus
                      : "pending"
                  }
                  type="payment"
                  size="medium"
                />
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Dates & Guests */}
        <Container marginBottom="lg">
          <Section title={t("bookings.tripDetailsTitle")}>
            <Container style={{ gap: 16 }}>
              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon
                    name="calendar-outline"
                    size={iconSize.sm}
                    color={theme.colors.primary}
                  />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    Check-in
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {formatDate(booking.checkIn, "long")}
                    </Text>
                  </Container>
                </Container>
              </Container>

              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon
                    name="calendar-outline"
                    size={iconSize.sm}
                    color={theme.colors.primary}
                  />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    Check-out
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {formatDate(booking.checkOut, "long")}
                    </Text>
                  </Container>
                </Container>
              </Container>

              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon
                    name="people-outline"
                    size={iconSize.sm}
                    color={theme.colors.primary}
                  />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    Guests
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {booking.guests.adults} adult
                      {booking.guests.adults !== 1 ? "s" : ""}
                      {booking.guests.children
                        ? `, ${booking.guests.children} child${
                            booking.guests.children !== 1 ? "ren" : ""
                          }`
                        : ""}
                      {booking.guests.infants
                        ? `, ${booking.guests.infants} infant${
                            booking.guests.infants !== 1 ? "s" : ""
                          }`
                        : ""}
                    </Text>
                  </Container>
                </Container>
              </Container>

              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon
                    name="time-outline"
                    size={iconSize.sm}
                    color={theme.colors.primary}
                  />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    Duration
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {daysCount} night{daysCount !== 1 ? "s" : ""}
                    </Text>
                  </Container>
                </Container>
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Contact Information */}
        {booking.contactInfo && (
          <Container marginBottom="lg">
            <Section title={t("bookings.contactInfoTitle")}>
              <Container style={{ gap: 16 }}>
                <Container flexDirection="row" alignItems="flex-start">
                  <Container width={32} alignItems="center" marginTop="sm">
                    <Icon
                      name="person-outline"
                      size={iconSize.sm}
                      color={theme.colors.primary}
                    />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("bookings.contactName")}
                    </Text>
                    <Container marginTop="xs">
                      <Text variant="caption" color={theme.colors.gray[600]}>
                        {booking.contactInfo.name}
                      </Text>
                    </Container>
                  </Container>
                </Container>

                <Container flexDirection="row" alignItems="flex-start">
                  <Container width={32} alignItems="center" marginTop="sm">
                    <Icon
                      name="mail-outline"
                      size={iconSize.sm}
                      color={theme.colors.primary}
                    />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("bookings.contactEmail")}
                    </Text>
                    <Container marginTop="xs">
                      <Text variant="caption" color={theme.colors.gray[600]}>
                        {booking.contactInfo.email}
                      </Text>
                    </Container>
                  </Container>
                </Container>

                {booking.contactInfo.phone && (
                  <Container flexDirection="row" alignItems="flex-start">
                    <Container width={32} alignItems="center" marginTop="sm">
                      <Icon
                        name="call-outline"
                        size={iconSize.sm}
                        color={theme.colors.primary}
                      />
                    </Container>
                    <Container flex={1} marginLeft="md">
                      <Text variant="body" weight="medium">
                        {t("bookings.contactPhone")}
                      </Text>
                      <Container marginTop="xs">
                        <Text variant="caption" color={theme.colors.gray[600]}>
                          {booking.contactInfo.phone}
                        </Text>
                      </Container>
                    </Container>
                  </Container>
                )}
              </Container>
            </Section>
          </Container>
        )}

        {/* Price Breakdown */}
        <Container marginBottom="lg">
          <Section title={t("bookings.priceDetailsTitle")}>
            <Container style={{ gap: 8 }}>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text variant="body">
                  $
                  {Math.round(
                    ((booking.pricing?.totalPrice ?? booking.totalAmount) ||
                      0) / daysCount
                  )}{" "}
                  x {daysCount} night{daysCount !== 1 ? "s" : ""}
                </Text>
                <Text variant="body">
                  $
                  {formatCurrency(
                    booking.pricing?.totalPrice ?? booking.totalAmount
                  )}
                </Text>
              </Container>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingTop="sm"
                borderTopWidth={1}
                borderColor="rgba(0,0,0,0.1)"
                marginTop="xs"
              >
                <Text variant="body" weight="semibold">
                  {t("bookings.total")}
                </Text>
                <Text variant="body" weight="semibold">
                  $
                  {formatCurrency(
                    booking.pricing?.totalPrice ?? booking.totalAmount
                  )}
                </Text>
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Special Requests */}
        {booking.specialRequests && (
          <Container marginBottom="lg">
            <Section title={t("bookings.specialRequestsTitle")}>
              <Text variant="body" color={theme.colors.gray[700]}>
                {booking.specialRequests}
              </Text>
            </Section>
          </Container>
        )}

        {/* Actions */}
        <Container marginBottom="lg">
          <Section>
            <Container style={{ gap: 16 }}>
              <Button
                variant="primary"
                title="Add to Calendar"
                onPress={handleAddToCalendar}
                icon={
                  <Icon
                    name="calendar-outline"
                    size={iconSize.sm}
                    color={theme.colors.white}
                  />
                }
                iconPosition="left"
              />
              {(property as any)?.coordinates && (
                <Button
                  variant="primary"
                  title="Get Directions"
                  onPress={handleGetDirections}
                  icon={
                    <Icon
                      name="navigate-outline"
                      size={iconSize.sm}
                      color={theme.colors.white}
                    />
                  }
                  iconPosition="left"
                />
              )}
              <Button
                variant="primary"
                title={t("bookings.contactHost")}
                onPress={handleContactHost}
                icon={
                  <Icon
                    name="logo-whatsapp"
                    size={iconSize.sm}
                    color={theme.colors.white}
                  />
                }
                iconPosition="left"
              />
              {canCancelBooking() && (
                <Button
                  variant="primary"
                  title="Cancel Booking"
                  onPress={handleCancelBooking}
                  icon={
                    <Icon
                      name="close-circle-outline"
                      size={iconSize.sm}
                      color={theme.colors.white}
                    />
                  }
                  iconPosition="left"
                />
              )}
            </Container>
          </Section>
        </Container>

        {/* Booking ID */}
        <Container marginBottom="xl">
          <Section>
            <Text
              variant="caption"
              color={theme.colors.gray[500]}
              style={{ textAlign: "center" }}
            >
              {t("bookings.bookingId")}: {booking._id}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.gray[400]}
              style={{ textAlign: "center", marginTop: 4 }}
            >
              {t("bookings.bookedOn")}:{" "}
              {formatDate(booking.createdAt, "medium")}
            </Text>
          </Section>
        </Container>
      </ScrollView>
    </Container>
  );
}
