/**
 * Booking Details Screen
 * Displays comprehensive booking information with actions
 * Unified component for both host and traveler views
 */

import React, { useState, useEffect } from "react";
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
import { useTheme, useCurrencyConversion } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useBookingDetails } from "@features/booking/hooks";
import { useCancelBooking } from "@features/booking/hooks/useBookings";
import { useHostBooking } from "@features/host/hooks/useHostBookings";
import { useBookingActions } from "@features/host/hooks";
import { calculateDaysCount, canUpdateBooking } from "@features/host/utils";

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
  Screen,
} from "@shared/components";

import { PropertyImageContainer } from "src/features/properties/components/details";

// Utils
import {
  formatDate,
  formatCurrency,
} from "@core/utils/data/formatting/data-formatters";
import { iconSize } from "@core/design";

interface BookingDetailsScreenProps {
  /** Whether this is a host view (default: false for traveler) */
  isHostView?: boolean;
  /** Custom title for the screen */
  customTitle?: string;
  /** Custom back navigation handler */
  onBackPress?: () => void;
}

export default function BookingDetailsScreen({
  isHostView = false,
  customTitle,
  onBackPress,
}: BookingDetailsScreenProps = {}) {
  const { theme } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { currency, supportedCurrencies } = useCurrency();
  const { convertAmount } = useCurrencyConversion();

  // Extract booking ID from route parameters
  const { bookingId, id, reservationId } = useLocalSearchParams<{
    bookingId?: string;
    id?: string;
    reservationId?: string;
  }>();
  const bookingIdParam = bookingId || id || reservationId || "";

  // Temporary debugging
  console.log("🔍 BookingDetailsScreen - Route params:", {
    bookingId,
    id,
    bookingIdParam,
    isHostView,
  });

  const { t } = useTranslation();

  // State for converted amounts (host view only)
  const [convertedTotalAmount, setConvertedTotalAmount] = useState<
    number | null
  >(null);

  // Fetch booking details based on view type
  const {
    data: travelerBooking,
    isLoading: travelerLoading,
    error: travelerError,
    refetch: travelerRefetch,
  } = useBookingDetails(isHostView ? "" : bookingIdParam); // Only call for traveler view

  const {
    booking: hostBooking,
    isLoading: hostLoading,
    error: hostError,
    refetch: hostRefetch,
  } = useHostBooking(isHostView ? bookingIdParam : ""); // Only call for host view

  // Guest cancel booking mutation
  const cancelBookingMutation = useCancelBooking();

  // Use the appropriate booking data and loading states
  const booking = isHostView ? hostBooking : travelerBooking;
  const isLoading = isHostView ? hostLoading : travelerLoading;
  const error = isHostView ? hostError : travelerError;
  const refetch = isHostView ? hostRefetch : travelerRefetch;

  // Temporary debugging
  console.log("🔍 BookingDetailsScreen - Hook results:", {
    isHostView,
    bookingIdParam,
    hostBooking: hostBooking ? "Found" : "Not found",
    travelerBooking: travelerBooking ? "Found" : "Not found",
    hostLoading,
    travelerLoading,
    hostError: hostError?.message,
    travelerError: travelerError?.message,
    finalBooking: booking ? "Found" : "Not found",
    finalLoading: isLoading,
    finalError: error?.message,
  });

  // Get booking actions for host view
  const {
    handleViewProperty: handleHostViewProperty,
    handleUpdateStatus,
    handleCalendarAction,
    handleDirectionsAction,
    handleContactAction,
    handleBackNavigation,
  } = useBookingActions();

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currencyInfo = supportedCurrencies.find(
      (curr) => curr.code === currency
    );
    return currencyInfo?.symbol || currency;
  };

  // Calculate days
  const getDaysCount = () => {
    if (!booking) return 0;
    if (isHostView) {
      return calculateDaysCount(booking.checkIn, booking.checkOut);
    }
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Convert total amount when currency or booking changes (host view only)
  useEffect(() => {
    if (!isHostView) return;

    const convertTotalAmount = async () => {
      if (booking) {
        const totalAmount = booking.totalPrice || 0;
        const converted = await convertAmount(totalAmount, "USD");
        setConvertedTotalAmount(converted);
      }
    };

    convertTotalAmount();
  }, [booking, currency, convertAmount, isHostView]);

  // Handle calendar actions (traveler view)
  const handleAddToCalendar = () => {
    if (!booking) return;
    const property = booking.propertyId as any;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const title = t("features.booking.calendar.calendarTitle", {
      property: property?.name || t("features.booking.details.property"),
    });
    const details = t("features.booking.calendar.calendarDetails", {
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
        showToast({
          message: t("features.booking.calendar.calendarError"),
          type: "error",
        });
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
        showToast({
          message: t("features.booking.calendar.calendarError"),
          type: "error",
        });
      });
    }
  };

  // Handle directions (traveler view)
  const handleGetDirections = () => {
    const property = booking?.propertyId as any;
    if (!property?.coordinates) {
      showToast({
        message: t("features.booking.location.locationError"),
        type: "error",
      });
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
      showToast({
        message: t("features.booking.location.mapsError"),
        type: "error",
      });
    });
  };

  // Handle contact host (traveler view)
  const handleContactHost = () => {
    const property = booking?.propertyId as any;
    const phone = property?.host?.phoneNumber || booking?.contactInfo?.phone;
    if (!phone) {
      showToast({
        message: t("features.booking.communication.whatsappError"),
        type: "error",
      });
      return;
    }
    // WhatsApp deep link
    const url = `https://wa.me/${phone}`;
    LinkingExpo.openURL(url).catch(() => {
      showToast({
        message: t("features.booking.communication.whatsappError"),
        type: "error",
      });
    });
  };

  // Handle cancel booking (traveler view)
  const handleCancelBooking = () => {
    Alert.alert(
      t("features.booking.cancellation.cancelBookingTitle"),
      t("features.booking.cancellation.cancelBookingMessage"),
      [
        {
          text: t("features.booking.cancellation.keepBooking"),
          style: "cancel",
        },
        {
          text: t("common.confirmCancel"),
          style: "destructive",
          onPress: async () => {
            if (!booking) return;
            try {
              await cancelBookingMutation.mutateAsync(booking._id);
              showToast({
                message: t("features.booking.cancellation.cancellationSuccess"),
                type: "success",
              });
              refetch();
            } catch (error) {
              showToast({
                message: t("features.booking.cancellation.cancellationFailed"),
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  // Handle property navigation (traveler view)
  const handleViewProperty = () => {
    if (!booking?.propertyId) return;

    router.push({
      pathname: "/(tabs)/traveler/bookings/property/[id]",
      params: {
        property: JSON.stringify(booking.propertyId),
        returnTo: `/(tabs)/traveler/bookings/${bookingIdParam}`,
      },
    });
  };

  // Check if booking can be cancelled (traveler view)
  const canCancelBooking = () => {
    if (!booking) return false;
    return (
      booking.bookingStatus === "confirmed" ||
      booking.bookingStatus === "pending"
    );
  };

  // Get screen title
  const getScreenTitle = () => {
    if (customTitle) return customTitle;
    return isHostView
      ? t("features.host.dashboard.reservations.detailsTitle")
      : t("features.booking.details.detailsTitle");
  };

  // Get back navigation handler
  const getBackHandler = () => {
    if (onBackPress) return onBackPress;
    if (isHostView) return handleBackNavigation;
    return () => router.back();
  };

  if (isLoading) {
    return (
      <Screen backgroundColor="background">
        <Header title={getScreenTitle()} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
        </Container>
      </Screen>
    );
  }

  if (error || !booking) {
    return (
      <Screen backgroundColor="background">
        <Header title={getScreenTitle()} />
        <EmptyState
          icon="calendar-outline"
          title={
            isHostView
              ? t("features.host.dashboard.reservations.notFound")
              : t("features.booking.errors.notFound")
          }
          message={
            isHostView
              ? t("features.host.dashboard.reservations.notFoundMessage")
              : t("features.booking.errors.notFoundMessage")
          }
          action={{
            label: t("common.retry"),
            onPress: () => refetch(),
          }}
        />
      </Screen>
    );
  }

  const property = booking.propertyId as any; // Type cast since backend returns populated property
  const daysCount = getDaysCount();

  return (
    <Screen
      header={{
        title: getScreenTitle(),
        showDivider: false,
        left: {
          icon: "chevron-back-outline",
          onPress: getBackHandler(),
        },
      }}
    >
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
                onPress={
                  isHostView ? handleHostViewProperty : handleViewProperty
                }
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
                        <Icon name="star" size={iconSize.xs} />
                        <Container marginLeft="xs">
                          <Text
                            variant="caption"
                            color={theme.colors.gray[600]}
                          >
                            {property.rating?.toFixed(1) ||
                              t("features.booking.details.newProperty")}
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
          <Section title={t("features.booking.details.status.title")}>
            <Container flexDirection="row" style={{ gap: 16 }}>
              <Container flex={1}>
                <BookingStatusBadge
                  status={booking.bookingStatus as any}
                  type="booking"
                  size="medium"
                />
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Dates & Guests */}
        <Container marginBottom="lg">
          <Section
            title={
              isHostView
                ? t("features.host.dashboard.reservations.tripDetailsTitle")
                : t("features.booking.details.tripDetailsTitle")
            }
          >
            <Container style={{ gap: 16 }}>
              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon name="calendar-outline" size={iconSize.sm} />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    {isHostView
                      ? t("features.host.dashboard.reservations.checkIn")
                      : t("features.booking.details.checkIn")}
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
                  <Icon name="calendar-outline" size={iconSize.sm} />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    {isHostView
                      ? t("features.host.dashboard.reservations.checkOut")
                      : t("features.booking.details.checkOut")}
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
                  <Icon name="people-outline" size={iconSize.sm} />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    {isHostView
                      ? t("features.host.dashboard.reservations.guests")
                      : t("features.booking.details.guests")}
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {isHostView ? (
                        <>
                          {booking.guests.adults}{" "}
                          {booking.guests.adults === 1
                            ? t("features.host.dashboard.reservations.adult")
                            : t("features.host.dashboard.reservations.adults")}
                          {booking.guests.children
                            ? `, ${booking.guests.children} ${
                                booking.guests.children === 1
                                  ? t(
                                      "features.host.dashboard.reservations.child"
                                    )
                                  : t(
                                      "features.host.dashboard.reservations.children"
                                    )
                              }`
                            : ""}
                          {booking.guests.infants
                            ? `, ${booking.guests.infants} ${
                                booking.guests.infants === 1
                                  ? t(
                                      "features.host.dashboard.reservations.infant"
                                    )
                                  : t(
                                      "features.host.dashboard.reservations.infants"
                                    )
                              }`
                            : ""}
                        </>
                      ) : (
                        <>
                          {booking.guests.adults}{" "}
                          {t("features.booking.details.adult")}
                          {booking.guests.adults !== 1 ? "s" : ""}
                          {booking.guests.children
                            ? `, ${booking.guests.children} ${t(
                                "features.booking.details.child"
                              )}${booking.guests.children !== 1 ? "ren" : ""}`
                            : ""}
                          {booking.guests.infants
                            ? `, ${booking.guests.infants} ${t(
                                "features.booking.details.infant"
                              )}${booking.guests.infants !== 1 ? "s" : ""}`
                            : ""}
                        </>
                      )}
                    </Text>
                  </Container>
                </Container>
              </Container>

              <Container flexDirection="row" alignItems="flex-start">
                <Container width={32} alignItems="center" marginTop="sm">
                  <Icon name="time-outline" size={iconSize.sm} />
                </Container>
                <Container flex={1} marginLeft="md">
                  <Text variant="body" weight="medium">
                    {isHostView
                      ? t("features.host.dashboard.reservations.duration")
                      : t("features.booking.details.duration")}
                  </Text>
                  <Container marginTop="xs">
                    <Text variant="caption" color={theme.colors.gray[600]}>
                      {isHostView ? (
                        <>
                          {daysCount}{" "}
                          {daysCount === 1
                            ? t("features.host.dashboard.reservations.night")
                            : t("features.host.dashboard.reservations.nights")}
                        </>
                      ) : (
                        <>
                          {daysCount} {t("features.booking.details.night")}
                          {daysCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </Text>
                  </Container>
                </Container>
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Guest Information (Host view only) */}
        {isHostView && booking.contactInfo && (
          <Container marginBottom="lg">
            <Section
              title={t("features.host.dashboard.reservations.guestInfoTitle")}
            >
              <Container style={{ gap: 16 }}>
                <Container flexDirection="row" alignItems="flex-start">
                  <Container width={32} alignItems="center" marginTop="sm">
                    <Icon name="person-outline" size={iconSize.sm} />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("features.host.dashboard.reservations.guestName")}
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
                    <Icon name="mail-outline" size={iconSize.sm} />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("features.host.dashboard.reservations.guestEmail")}
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
                      <Icon name="call-outline" size={iconSize.sm} />
                    </Container>
                    <Container flex={1} marginLeft="md">
                      <Text variant="body" weight="medium">
                        {t("features.host.dashboard.reservations.guestPhone")}
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

        {/* Contact Information (Traveler view only) */}
        {!isHostView && booking.contactInfo && (
          <Container marginBottom="lg">
            <Section title={t("features.booking.details.contactInfoTitle")}>
              <Container style={{ gap: 16 }}>
                <Container flexDirection="row" alignItems="flex-start">
                  <Container width={32} alignItems="center" marginTop="sm">
                    <Icon name="person-outline" size={iconSize.sm} />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("features.booking.details.contactName")}
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
                    <Icon name="mail-outline" size={iconSize.sm} />
                  </Container>
                  <Container flex={1} marginLeft="md">
                    <Text variant="body" weight="medium">
                      {t("features.booking.details.contactEmail")}
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
                      <Icon name="call-outline" size={iconSize.sm} />
                    </Container>
                    <Container flex={1} marginLeft="md">
                      <Text variant="body" weight="medium">
                        {t("features.booking.details.contactPhone")}
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
          <Section
            title={
              isHostView
                ? t("features.host.dashboard.reservations.priceDetailsTitle")
                : t("features.booking.details.priceDetailsTitle")
            }
          >
            <Container style={{ gap: 8 }}>
              {!isHostView && (
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
                    x {daysCount} {t("features.booking.details.night")}
                    {daysCount !== 1 ? "s" : ""}
                  </Text>
                  <Text variant="body">
                    $
                    {formatCurrency(
                      booking.pricing?.totalPrice ?? booking.totalAmount
                    )}
                  </Text>
                </Container>
              )}
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
                  {isHostView
                    ? t("features.host.dashboard.reservations.total")
                    : t("features.booking.details.total")}
                </Text>
                <Text variant="body" weight="semibold">
                  {isHostView ? (
                    <>
                      {getCurrencySymbol()}
                      {formatCurrency(convertedTotalAmount || 0)}
                    </>
                  ) : (
                    <>
                      $
                      {formatCurrency(
                        booking.pricing?.totalPrice ?? booking.totalAmount
                      )}
                    </>
                  )}
                </Text>
              </Container>
            </Container>
          </Section>
        </Container>

        {/* Special Requests */}
        {booking.specialRequests && (
          <Container marginBottom="lg">
            <Section
              title={
                isHostView
                  ? t(
                      "features.host.dashboard.reservations.specialRequestsTitle"
                    )
                  : t("features.booking.details.specialRequestsTitle")
              }
            >
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
              {isHostView ? (
                // Host actions (stacked vertically, only confirm/cancel)
                <>
                  <Button
                    variant="primary"
                    title={t(
                      "features.host.dashboard.reservations.confirmBooking"
                    )}
                    onPress={async () => {
                      if (!booking) return;
                      const updated = await handleUpdateStatus(
                        booking,
                        "confirmed"
                      );
                      if (
                        updated &&
                        typeof updated === "object" &&
                        "status" in updated
                      ) {
                        booking.status =
                          updated.status as typeof booking.status;
                      }
                    }}
                    icon={
                      <Icon
                        name="checkmark-circle-outline"
                        size={iconSize.sm}
                      />
                    }
                    iconPosition="left"
                  />
                  <Button
                    variant="secondary"
                    title={t(
                      "features.host.dashboard.reservations.cancelBooking"
                    )}
                    onPress={async () => {
                      if (!booking) return;
                      const updated = await handleUpdateStatus(
                        booking,
                        "cancelled"
                      );
                      if (
                        updated &&
                        typeof updated === "object" &&
                        "status" in updated
                      ) {
                        booking.status =
                          updated.status as typeof booking.status;
                      }
                    }}
                    icon={
                      <Icon
                        name="close-circle-outline"
                        size={iconSize.sm}
                        color={theme.colors.white}
                      />
                    }
                    iconPosition="left"
                  />
                </>
              ) : (
                // Traveler actions
                <>
                  <Button
                    variant="primary"
                    title={t("features.booking.actions.addToCalendar")}
                    onPress={handleAddToCalendar}
                    icon={<Icon name="calendar-outline" size={iconSize.sm} />}
                    iconPosition="left"
                  />
                  {(property as any)?.coordinates && (
                    <Button
                      variant="primary"
                      title={t("features.booking.actions.getDirections")}
                      onPress={handleGetDirections}
                      icon={<Icon name="navigate-outline" size={iconSize.sm} />}
                      iconPosition="left"
                    />
                  )}
                  <Button
                    variant="primary"
                    title={t("features.booking.actions.contactHost")}
                    onPress={handleContactHost}
                    icon={<Icon name="logo-whatsapp" size={iconSize.sm} />}
                    iconPosition="left"
                  />
                  {booking &&
                    (booking.bookingStatus === "confirmed" ||
                      booking.bookingStatus === "pending") && (
                      <Button
                        variant="primary"
                        title={t("features.booking.actions.cancelBooking")}
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
                </>
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
              {isHostView
                ? t("features.host.dashboard.reservations.reservationId")
                : t("features.booking.details.bookingId")}
              : {booking._id}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.gray[400]}
              style={{ textAlign: "center", marginTop: 4 }}
            >
              {isHostView
                ? t("features.host.dashboard.reservations.bookedOn")
                : t("features.booking.details.bookedOn")}
              : {formatDate(booking.createdAt, "medium")}
            </Text>
          </Section>
        </Container>
      </ScrollView>
    </Screen>
  );
}
