import type { PropertyType } from "@common/types/property";

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
  return property?.title || "Property Details";
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
