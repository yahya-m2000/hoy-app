import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import type { PropertyType } from "@common/types/property";
import { useTheme } from "@common-context/ThemeContext";
import { useDateSelection } from "@common-context/DateSelectionContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

// Import modular components
import {
  PropertyActionsHeader,
  PropertyHeader,
  SectionDivider,
  RatingsReviewsSection,
  HostSection,
  DescriptionSection,
  AmenitiesSection,
  LocationMapSection,
  ContactSection,
  BookingBar,
  MessageHostModal,
  PolicyNavigationItem,
  DatesSection,
} from "@traveler/components";

// Import hooks
import { usePropertyDetails, usePropertyActions } from "@traveler/hooks";

// Import utils
import { getPropertyTitle } from "@traveler/utils";

// Main component
const PropertyModalScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { propertyDates } = useDateSelection();

  // Get property data from params
  const propertyParam = params.property as string;
  const property: PropertyType = React.useMemo(() => {
    return propertyParam ? JSON.parse(propertyParam) : null;
  }, [propertyParam]); // Use modular hooks
  const {
    showFullDescription,
    setShowFullDescription,
    host,
    hostLoading,
    messageModalVisible,
    setMessageModalVisible,
    messageContent,
    setMessageContent,
    sendingMessage,
    setSendingMessage,
    isWishlisted,
    selectedDates,
    nights,
    handleWishlist,
  } = usePropertyDetails(property);
  const {
    handleShare,
    handleReserve,
    handleChangeDates,
    handleMessageHost,
    handleSendMessage,
  } = usePropertyActions(property);

  // Ensure selectedDates always has a fallback value for components
  const safeSelectedDates = selectedDates || { startDate: null, endDate: null };

  // Animation values for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0.8, 1],
    extrapolate: "clamp",
  });

  if (!property) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
          },
        ]}
      >
        <Text
          style={{
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          }}
        >
          {t("property.propertyNotFound")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      <PropertyActionsHeader
        headerOpacity={headerOpacity}
        propertyTitle={getPropertyTitle(property)}
        onGoBack={() => navigation.goBack()}
        onShare={handleShare}
        onWishlist={handleWishlist}
        isWishlisted={isWishlisted}
      />
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image, Title, Location + listing type */}
        <PropertyHeader property={property} />
        {/* Ratings | Reviews */}
        <RatingsReviewsSection
          rating={property.rating}
          reviewCount={property.reviewCount}
          onShowReviews={() => {
            // Navigate to reviews screen or show reviews modal
            console.log("Show reviews");
          }}
        />
        <SectionDivider />
        {/* Host image | host name */}
        <DatesSection
          selectedDates={safeSelectedDates}
          propertyPrice={property.price}
          onChangeDates={handleChangeDates}
        />
        <HostSection
          host={host}
          hostLoading={hostLoading}
          onMessageHost={() =>
            handleMessageHost(property, host, setMessageModalVisible)
          }
        />
        <SectionDivider />
        {/* About this place */}
        <DescriptionSection description={property.description} />
        <SectionDivider />
        {/* What this place offers */}
        <AmenitiesSection amenities={property.amenities || []} />
        <SectionDivider />
        {/* Where you'll be (map) */}
        <LocationMapSection
          location={property.location}
          onShowMap={() => {
            // Navigate to map screen or show map modal
            console.log("Show map");
          }}
        />
        {/* Contact */}
        <ContactSection
          phoneNumber={undefined}
          whatsappNumber={undefined}
        />{" "}
        {/* Availability */}
        <PolicyNavigationItem
          icon="calendar-today"
          title={t("property.availability")}
          subtitle={t("property.checkAvailableDates")}
          route="/(modals)/traveler/availability-calendar"
        />{" "}
        {/* Cancellation policy */}
        <PolicyNavigationItem
          icon="cancel"
          title={t("property.cancellationPolicy")}
          subtitle={t("property.moderateCancellationPolicy")}
          route="/(modals)/traveler/cancellation-policy"
        />
        <PolicyNavigationItem
          icon="home"
          title={t("property.houseRules")}
          subtitle={t("property.checkInAfter")}
          route="/(modals)/traveler/house-rules"
        />
        <PolicyNavigationItem
          icon="shield"
          title={t("property.safetyAndProperty")}
          subtitle={t("property.safetyInformation")}
          route="/(modals)/traveler/safety-and-property"
        />
        <View style={{ height: 80 }} />
      </Animated.ScrollView>{" "}
      <BookingBar
        price={property.price}
        totalPrice={nights > 0 ? property.price * nights : undefined}
        selectedDates={safeSelectedDates}
        onReserve={() => handleReserve(propertyDates)}
      />
      <MessageHostModal
        visible={messageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        host={host}
        propertyTitle={property.title}
        messageContent={messageContent}
        onMessageChange={setMessageContent}
        onSendMessage={() =>
          handleSendMessage(
            property,
            messageContent,
            setMessageContent,
            setMessageModalVisible,
            setSendingMessage
          )
        }
        sendingMessage={sendingMessage}
      />
    </View>
  );
};

// Styles definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 88 : 60,
    backgroundColor: "#fff",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 44 : 10,

    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fixedHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  fixedButtonsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 44 : 30,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  rightButtonsContainer: {
    flexDirection: "row",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: spacing.md,
  },
  sectionContainer: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: spacing.md,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
  },
  showAllButton: {
    marginTop: spacing.sm,
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  hostInfo: {
    flex: 1,
    marginLeft: 16,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
  },
  hostDetails: {
    fontSize: 14,
  },
  bookingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  perNight: {
    fontSize: 14,
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  reserveButton: {
    backgroundColor: "#ff385c",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  dateSelectionContainer: {
    marginBottom: spacing.md,
  },
  datesBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  dateRow: {
    flex: 1,
    padding: spacing.md,
  },
  dateDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    marginRight: 10,
  },
  messageHostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  messageHostButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  messageInput: {
    borderRadius: 8,
    height: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
  },
});

export default PropertyModalScreen;
