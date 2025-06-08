import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import type { PropertyType } from "@shared/types/property";
import { useTheme } from "@shared/context/ThemeContext";
import { useDateSelection } from "@shared/context/DateSelectionContext";
import { spacing } from "@shared/constants/spacing";
import { radius } from "@shared/constants/radius";

// Import modular components
import { PropertyImageCarousel } from "@modules/properties/components/Carousels";
import {
  SectionDivider,
  RatingsReviewsSection,
  HostSection,
  DescriptionSection,
  AmenitiesSection,
  LocationMapSection,
  DatesSection,
} from "@modules/properties/components/Sections";
import { MessageHostModal } from "@modules/properties/components/Modals";
import { PolicyNavigationItem } from "@modules/properties/components/Details";

// Import hooks from shared
import { usePropertyDetails } from "@shared/hooks/usePropertyDetails";

// Main component
const PropertyDetailsScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { propertyDates } = useDateSelection();

  // Get property data from params
  const propertyParam = params.property as string;
  const property: PropertyType = React.useMemo(() => {
    return propertyParam ? JSON.parse(propertyParam) : null;
  }, [propertyParam]);
  // Use modular hooks
  const {
    host,
    hostLoading,
    messageModalVisible,
    setMessageModalVisible,
    messageContent,
    setMessageContent,
    sendingMessage,
    setSendingMessage,
    selectedDates,
    nights,
  } = usePropertyDetails(property);

  // TODO: Implement property actions hooks
  const handleShare = () => console.log("Share not implemented");
  const handleReserve = () => console.log("Reserve not implemented");
  const handleChangeDates = () => console.log("Change dates not implemented");
  const handleMessageHost = () => console.log("Message host not implemented");
  const handleSendMessage = () => console.log("Send message not implemented");

  // Ensure selectedDates always has a fallback value for components
  const safeSelectedDates = selectedDates || { startDate: null, endDate: null };

  // Animation values for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

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
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Carousel with overlaid Rating Reviews */}
        <View>
          <PropertyImageCarousel property={property} />
          <View style={styles.ratingsOverlay}>
            <RatingsReviewsSection
              rating={property.rating || 0}
              reviewCount={property.reviewCount || 0}
              onShowReviews={() => {
                // Navigate to reviews screen or show reviews modal
                console.log("Show reviews");
              }}
            />
          </View>
        </View>{" "}
        {/* Host image | host name */}
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.background },
          ]}
        >
          <DatesSection
            selectedDates={safeSelectedDates}
            propertyPrice={
              typeof property.price === "object"
                ? property.price.amount
                : property.price
            }
            onChangeDates={handleChangeDates}
          />
          <SectionDivider />
          <HostSection
            host={host}
            hostLoading={hostLoading}
            onMessageHost={handleMessageHost}
          />
          <SectionDivider />
          {/* About this place */}
          <DescriptionSection description={property.description} />
          <SectionDivider />
          {/* What this place offers */}
          <AmenitiesSection amenities={property.amenities || []} />
          <SectionDivider /> {/* Where you'll be (map) */}{" "}
          <LocationMapSection
            location={
              property.address
                ? `${property.address.city}, ${property.address.country}`
                : "Location not available"
            }
            onShowMap={() => {
              // Navigate to map screen or show map modal
              console.log("Show map");
            }}
          />
        </View>
        {/* Availability */}{" "}
        <PolicyNavigationItem
          icon="calendar-today"
          title={t("property.availability")}
          subtitle={t("property.checkAvailableDates")}
          route="/(overlays)/traveler/availability-calendar"
        />
        {/* Cancellation policy */}
        <PolicyNavigationItem
          icon="cancel"
          title={t("property.cancellationPolicy")}
          subtitle={t("property.moderateCancellationPolicy")}
          route="/(overlays)/traveler/cancellation-policy"
        />
        <PolicyNavigationItem
          icon="home"
          title={t("property.houseRules")}
          subtitle={t("property.checkInAfter")}
          route="/(overlays)/traveler/house-rules"
        />
        <PolicyNavigationItem
          icon="shield"
          title={t("property.safetyAndProperty")}
          subtitle={t("property.safetyInformation")}
          route="/(overlays)/traveler/safety-and-property"
        />{" "}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
      <MessageHostModal
        visible={messageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        host={host}
        propertyTitle={property.name}
        messageContent={messageContent}
        onMessageChange={setMessageContent}
        onSendMessage={handleSendMessage}
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
    gap: spacing.xl,
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
  }, // ===== HERO SECTION STYLES =====
  heroSection: {
    position: "relative",
    marginBottom: spacing.md,
  },
  ratingsOverlay: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    zIndex: 3, // Above all other overlays
    maxWidth: "70%", // Prevent overlap with property info
  },
});

export default PropertyDetailsScreen;
