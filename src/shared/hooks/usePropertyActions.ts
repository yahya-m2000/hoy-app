import { router, usePathname } from "expo-router";
import type { PropertyType } from "@shared/types/property";
import { useAuth } from "@shared/context/AuthContext";
import { showAuthPrompt } from "@shared/utils/authUtils";

export const usePropertyActions = (property: PropertyType | null) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Determine the current tab context based on pathname
  const getCurrentTabContext = () => {
    if (pathname.includes("/traveler/home/")) return "home";
    if (pathname.includes("/traveler/search/")) return "search";
    if (pathname.includes("/traveler/wishlist/")) return "wishlist";
    if (pathname.includes("/traveler/bookings/")) return "bookings";
    if (pathname.includes("/traveler/properties/")) return "properties";
    return "properties"; // fallback
  };

  // Get the appropriate return route based on current context
  const getReturnRoute = () => {
    const context = getCurrentTabContext();
    switch (context) {
      case "home":
        return "(tabs)/traveler/home/property/[id]";
      case "search":
        return "(tabs)/traveler/search/property/[id]";
      case "wishlist":
        return "(tabs)/traveler/wishlist/property/[id]";
      case "bookings":
        return "(tabs)/traveler/bookings/property/[id]";
      case "properties":
        return "(tabs)/traveler/properties/property/[id]";
      default:
        return "(tabs)/traveler/properties/property/[id]";
    }
  };

  // Share handler
  const handleShare = () => {
    alert("Share functionality coming soon!");
  };
  // Handle reserve button press
  const handleReserve = (propertyDates: Map<string, any>) => {
    if (!property) return;

    // Check authentication first - before any navigation
    if (!isAuthenticated) {
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
        pathname: "/modules/properties/details/modals/availability-calendar",
        params: {
          propertyId: property._id,
          property: JSON.stringify(property),
        },
      });
      return;
    }

    // Dates selected - proceed with reservation (Reserve flow)
    router.push({
      pathname: "/(overlays)/traveler/reservation",
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
      pathname: "/(overlays)/search/dates",
      params: {
        propertyId: property._id,
        returnTo: getReturnRoute(),
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
    if (!property?.host && !property?.hostId) {
      console.error("Missing host ID", property);
      alert("Cannot message host: Missing host information");
      return;
    }

    const propertyHostId = property.hostId || property.host;
    if (propertyHostId !== host?._id) {
      console.warn("Host ID mismatch detected", {
        propertyHostId: propertyHostId,
        loadedHostId: host?._id,
      });
    }
    console.log("Opening message modal for:", {
      propertyId: property._id,
      propertyTitle: property.name || property.title || "Property",
      hostId: property.hostId || property.host,
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
