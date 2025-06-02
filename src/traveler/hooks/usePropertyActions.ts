import { router } from "expo-router";
import type { PropertyType } from "@common/types/property";
import { useAuth } from "@common/context/AuthContext";
import { showAuthPrompt } from "@common/utils/authUtils";

export const usePropertyActions = (property: PropertyType | null) => {
  const { user, accessToken } = useAuth();

  // Share handler
  const handleShare = () => {
    alert("Share functionality coming soon!");
  };
  // Handle reserve button press
  const handleReserve = (propertyDates: Map<string, any>) => {
    if (!property) return;

    // Check authentication first - before any navigation
    if (!user || !accessToken) {
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to make a reservation.",
      });
      return;
    }

    const dates = propertyDates.get(property._id)?.selectedDates;

    if (!dates?.startDate || !dates?.endDate) {
      // No dates selected - open availability calendar modal (Check Availability flow)
      router.push({
        pathname: "/(modals)/traveler/availability-calendar",
        params: {
          propertyId: property._id,
          property: JSON.stringify(property),
        },
      });
      return;
    }

    // Dates selected - proceed with reservation (Reserve flow)
    router.push({
      pathname: "/(modals)/traveler/reservation",
      params: {
        property: JSON.stringify(property),
        startDate: dates.startDate.toISOString(),
        endDate: dates.endDate.toISOString(),
      },
    });
  };

  // Handle change dates
  const handleChangeDates = () => {
    if (!property) return;

    router.push({
      pathname: "/(modals)/traveler/search-dates",
      params: {
        propertyId: property._id,
        returnTo: "/(screens)/traveler/property-details",
        property: JSON.stringify(property),
      },
    });
  };

  // Handle message host
  const handleMessageHost = (
    property: PropertyType,
    host: any,
    setMessageModalVisible: (visible: boolean) => void
  ) => {
    if (!property?._id) {
      console.error("Missing property ID", property);
      alert("Cannot message host: Missing property information");
      return;
    }

    if (!property?.hostId) {
      console.error("Missing host ID", property);
      alert("Cannot message host: Missing host information");
      return;
    }

    if (property.hostId !== host?._id) {
      console.warn("Host ID mismatch detected", {
        propertyHostId: property.hostId,
        loadedHostId: host?._id,
      });
    }

    console.log("Opening message modal for:", {
      propertyId: property._id,
      propertyTitle: property.title,
      hostId: property.hostId,
      hostName: host?.firstName,
    });

    setMessageModalVisible(true);
  };

  // Send message handler
  const handleSendMessage = async (
    property: PropertyType | null,
    messageContent: string,
    setMessageContent: (content: string) => void,
    setMessageModalVisible: (visible: boolean) => void,
    setSendingMessage: (sending: boolean) => void
  ) => {
    if (!property?._id) {
      console.error("Missing property ID");
      alert("Cannot send message: Property information missing");
      return;
    }

    if (!messageContent.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setSendingMessage(true);
      // TODO: Implement actual message sending logic
      // This would use the chat context when available
      console.log("Would send message:", messageContent.trim());

      // For now, just clear and close
      setMessageContent("");
      setMessageModalVisible(false);
      alert("Message functionality will be implemented soon!");
    } catch (error) {
      console.error("Failed to send message:", error);
      if (error instanceof Error) {
        alert(`Failed to send message: ${error.message}`);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    handleShare,
    handleReserve,
    handleChangeDates,
    handleMessageHost,
    handleSendMessage,
  };
};
