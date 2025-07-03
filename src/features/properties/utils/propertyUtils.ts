import type { PropertyType } from "@core/types";

// Safe validation utility function to validate MongoDB ObjectId format
export const validatePropertyId = (
  property: PropertyType | null | undefined
): { isValid: boolean; error?: string } => {
  if (!property) {
    return { isValid: false, error: "Property is null or undefined" };
  }

  if (!property._id) {
    return { isValid: false, error: "Property ID is missing" };
  }

  if (typeof property._id !== "string") {
    return {
      isValid: false,
      error: `Property ID is not a string (${typeof property._id})`,
    };
  }

  try {
    if (!property._id.match(/^[0-9a-fA-F]{24}$/)) {
      return {
        isValid: false,
        error: `Invalid MongoDB ObjectId format: ${property._id}`,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating property ID: ${error}`,
    };
  }

  return { isValid: true };
};

// Helper to get property title
export const getPropertyTitle = (property: PropertyType | null): string => {
  return property?.name || "Property Details";
};

// Calculate stay duration
export const calculateNights = (selectedDates: {
  startDate: Date | null;
  endDate: Date | null;
}): number => {
  if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
  const diffTime = Math.abs(
    selectedDates.endDate.getTime() - selectedDates.startDate.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format price utility
export const formatPrice = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format location display utility
export const formatLocationDisplay = (locationData: {
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  city?: string;
  country?: string;
  location?: any; // Legacy support
}): string => {
  const { address, city, country, location } = locationData;

  // Use new address structure first
  if (address?.city && address?.country) {
    return `${address.city}, ${address.country}`;
  }

  if (address?.city && address?.state) {
    return `${address.city}, ${address.state}`;
  }

  if (address?.city) {
    return address.city;
  }

  // Fallback to legacy props for backward compatibility
  if (city && country) {
    return `${city}, ${country}`;
  }

  if (city) {
    return city;
  }

  // Handle legacy string location (for backward compatibility)
  if (typeof location === "string" && location.trim()) {
    return location;
  }

  // Handle legacy location object
  if (typeof location === "object" && location) {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }

    if (location.city) {
      return location.city;
    }

    // Handle nested address object in legacy structure
    if (location.address) {
      const addr = location.address;
      if (addr.city && addr.country) {
        return `${addr.city}, ${addr.country}`;
      }
      if (addr.city && addr.state) {
        return `${addr.city}, ${addr.state}`;
      }
      if (addr.city) {
        return addr.city;
      }
    }
  }

  return "Location not available";
};

// Calculate stay details utility
export const calculateStayDetails = (
  price: number,
  searchDates?: {
    startDate?: Date | null;
    endDate?: Date | null;
  }
) => {
  let nights = 3; // Default 3 nights
  let startDate = searchDates?.startDate;
  let endDate = searchDates?.endDate;

  // If we have search dates, use them to calculate nights
  if (startDate && endDate) {
    nights = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }

  const totalPrice = price * nights;
  return { nights, totalPrice };
};

// Format booking date utility
export const formatBookingDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Calculate booking nights utility
export const calculateBookingNights = (
  checkIn: string,
  checkOut: string
): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format date range for display
export const formatDateRange = (
  startDate?: Date | null,
  endDate?: Date | null
): string => {
  if (!startDate || !endDate) {
    return "Available year\u00A0round";
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  return `${startDate.toLocaleDateString(
    "en-US",
    formatOptions
  )} - ${endDate.toLocaleDateString("en-US", formatOptions)}`;
};
