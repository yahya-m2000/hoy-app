/**
 * Calendar Selection Action Bar
 * Action bar that appears when dates are selected in the calendar
 */

import React from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";

interface CalendarSelectionActionBarProps {
  selectedDates: string[];
  isVisible: boolean;
  onCancel: () => void;
  onToggleAvailability: () => void;
  onEditPrice: () => void;
  onCustomSettings: () => void;
  isAvailable: boolean;
}

const CalendarSelectionActionBar: React.FC<CalendarSelectionActionBarProps> = ({
  selectedDates,
  isVisible,
  onCancel,
  onToggleAvailability,
  onEditPrice,
  onCustomSettings,
  isAvailable,
}) => {
  const theme = useTheme();

  if (!isVisible || selectedDates.length === 0) {
    return null;
  }

  const formatSelectedDatesText = () => {
    if (selectedDates.length === 1) {
      const date = new Date(selectedDates[0]);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (selectedDates.length === 2) {
      const startDate = new Date(selectedDates[0]);
      const endDate = new Date(selectedDates[1]);
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }

    return `${selectedDates.length} days selected`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.content}>
        {/* Header with selection info */}
        <View style={styles.header}>
          <Text style={[styles.selectionText, { color: theme.text.primary }]}>
            {formatSelectedDatesText()}
          </Text>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          {/* Availability Toggle */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isAvailable
                  ? theme.colors.success
                  : theme.colors.error,
              },
            ]}
            onPress={onToggleAvailability}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.white }]}
            >
              {isAvailable ? "Available" : "Blocked"}
            </Text>
          </Pressable>

          {/* Price Per Night */}
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onEditPrice}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.white }]}
            >
              Price per night
            </Text>
          </Pressable>

          {/* Custom Settings */}
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={onCustomSettings}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.white }]}
            >
              Custom settings
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CalendarSelectionActionBar;
