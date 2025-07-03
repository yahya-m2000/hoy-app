import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks";
import { fontSize, fontWeight, spacing } from "@core/design";
import ReservationList from "./ReservationList";
import ReservationFilterSection from "./ReservationFilterSection";
import { FilterType } from "./FilterTabs";
import { Reservation } from "./ReservationCard";

interface ReservationsSectionProps {
  reservations: Reservation[];
  onReservationPress?: (reservation: Reservation) => void;
  onViewAllPress?: () => void;
  showFilterTabs?: boolean; // Option to show/hide filter tabs
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({
  reservations,
  onReservationPress,
  onViewAllPress,
  showFilterTabs = true, // Default to showing filter tabs
}) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Your reservations
        </Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
              View all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {showFilterTabs && (
        <ReservationFilterSection
          reservations={reservations}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          noPaddingHorizontal={true}
        />
      )}

      <ReservationList
        reservations={reservations}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onReservationPress={onReservationPress}
        maxDisplayCount={3}
        onViewAllPress={onViewAllPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  viewAllText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});

export default ReservationsSection;
