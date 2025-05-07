/**
 * Date utility functions tests
 */
import {
  isValidDate,
  toSafeDate,
  toSafeISOString,
  getRelativeTime,
} from "./dateUtils";

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "a few seconds ago"),
}));

describe("Date Utility Functions", () => {
  describe("isValidDate", () => {
    it("should return false for null or undefined values", () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });

    it("should return true for valid Date objects", () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date("2023-01-01"))).toBe(true);
    });

    it("should return true for valid date strings", () => {
      expect(isValidDate("2023-01-01")).toBe(true);
      expect(isValidDate("2023-01-01T12:00:00Z")).toBe(true);
    });

    it("should return false for invalid dates", () => {
      expect(isValidDate("not a date")).toBe(false);
      expect(isValidDate("2023-99-99")).toBe(false);
      expect(isValidDate(new Date("invalid"))).toBe(false);
    });
  });

  describe("toSafeDate", () => {
    it("should return a fallback date for null or undefined values", () => {
      const fallback = new Date("2022-01-01");
      expect(toSafeDate(null, fallback)).toEqual(fallback);
      expect(toSafeDate(undefined, fallback)).toEqual(fallback);
    });

    it("should return the original date for valid Date objects", () => {
      const validDate = new Date("2023-01-01");
      expect(toSafeDate(validDate).getTime()).toEqual(validDate.getTime());
    });

    it("should convert valid date strings to Date objects", () => {
      const date = toSafeDate("2023-01-01");
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
    });

    it("should return fallback for invalid date strings", () => {
      const fallback = new Date("2022-01-01");
      expect(toSafeDate("not a date", fallback)).toEqual(fallback);
    });

    it("should return current date as default fallback", () => {
      // Mock current date
      const mockDate = new Date("2023-01-01");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      expect(toSafeDate("not a date").getTime()).toEqual(mockDate.getTime());

      // Restore original Date
      jest.spyOn(global, "Date").mockRestore();
    });
  });

  describe("toSafeISOString", () => {
    it("should return null for invalid dates", () => {
      expect(toSafeISOString(null)).toBeNull();
      expect(toSafeISOString(undefined)).toBeNull();
      expect(toSafeISOString("not a date")).toBeNull();
    });

    it("should return ISO string for valid dates", () => {
      const validDate = new Date("2023-01-01T12:00:00Z");
      expect(toSafeISOString(validDate)).toBe(validDate.toISOString());
      expect(toSafeISOString("2023-01-01")).toBeTruthy();
    });
  });

  describe("getRelativeTime", () => {
    it("should return default value for invalid dates", () => {
      expect(getRelativeTime(null)).toBe("Recently");
      expect(getRelativeTime(undefined)).toBe("Recently");
      expect(getRelativeTime("not a date")).toBe("Recently");
    });

    it("should return formatted relative time for valid dates", () => {
      expect(getRelativeTime(new Date())).toBe("a few seconds ago");
      expect(getRelativeTime("2023-01-01")).toBe("a few seconds ago");
    });

    it("should use custom default value when provided", () => {
      expect(getRelativeTime(null, "Custom default")).toBe("Custom default");
    });
  });
});
