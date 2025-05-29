/**
 * ReservationsList Component
 * Displays upcoming reservations for host dashboard
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";
import Card from "@common-components/Card";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "src/common/components/EmptyState";
import Avatar from "src/common/components/Avatar";
import { useHostDashboard } from "../../../../src/host/hooks/useHostDashboard";

// Use any for now to avoid TypeScript errors with the guests property
interface ReservationsListProps {
  isLoading: boolean;
  reservations: any[] | undefined;
}

const ReservationsList = ({
  isLoading,
  reservations,
}: ReservationsListProps) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { formatDate, calculateDays } = useHostDashboard();

  return (
    <Card
      title={t("host.upcomingReservations")}
      icon="calendar-outline"
      onPress={() => router.push("/host/reservations")}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : reservations && reservations.length > 0 ? (
        <>
          <View style={styles.reservationsList}>
            {reservations.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={[
                  styles.reservationItem,
                  {
                    borderBottomColor: isDark
                      ? theme.colors.grayPalette[800]
                      : theme.colors.grayPalette[200],
                  },
                ]}
                onPress={() =>
                  router.push(`/host/reservations/${reservation.id}`)
                }
              >
                <View style={styles.reservationGuest}>
                  <Avatar
                    size="sm"
                    source={reservation.guestPhoto}
                    name={reservation.guestName}
                  />
                  <View style={styles.reservationGuestInfo}>
                    <Text
                      style={[
                        styles.reservationGuestName,
                        {
                          color: isDark
                            ? theme.colors.white
                            : theme.colors.grayPalette[900],
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {reservation.guestName}
                    </Text>
                    <Text
                      style={[
                        styles.reservationPropertyName,
                        {
                          color: isDark
                            ? theme.colors.grayPalette[400]
                            : theme.colors.grayPalette[600],
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {reservation.propertyTitle}
                    </Text>
                  </View>
                </View>
                <View style={styles.reservationDates}>
                  <Text
                    style={[
                      styles.reservationDate,
                      {
                        color: isDark
                          ? theme.colors.grayPalette[300]
                          : theme.colors.grayPalette[700],
                      },
                    ]}
                  >
                    {formatDate(reservation.checkIn)}{" "}
                    <Text
                      style={{
                        color: isDark
                          ? theme.colors.grayPalette[500]
                          : theme.colors.grayPalette[400],
                      }}
                    >
                      →
                    </Text>{" "}
                    {formatDate(reservation.checkOut)}
                  </Text>
                  <Text
                    style={[
                      styles.reservationNights,
                      {
                        color: isDark
                          ? theme.colors.grayPalette[400]
                          : theme.colors.grayPalette[600],
                      },
                    ]}
                  >
                    {calculateDays(reservation.checkIn, reservation.checkOut)}{" "}
                    {calculateDays(
                      reservation.checkIn,
                      reservation.checkOut
                    ) === 1
                      ? t("common.night")
                      : t("common.nights")}
                    {" • "}
                    {reservation.guests}{" "}
                    {reservation.guests === 1
                      ? t("common.guest")
                      : t("common.guests")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.viewAllButton,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[200],
              },
            ]}
            onPress={() => router.push("/host/reservations")}
          >
            <Text
              style={[
                styles.viewAllButtonText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {t("host.viewAllReservations")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[700]
              }
            />
          </TouchableOpacity>
        </>
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={t("host.noReservations")}
          message={t("host.noReservationsDesc")}
          minimized
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  reservationsList: {
    marginVertical: spacing.sm,
  },
  reservationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  reservationGuest: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reservationGuestInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  reservationGuestName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  reservationPropertyName: {
    fontSize: fontSize.sm,
  },
  reservationDates: {
    alignItems: "flex-end",
  },
  reservationDate: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  reservationNights: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  viewAllButtonText: {
    fontWeight: "500",
    marginRight: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
  },
  loadingText: {
    fontSize: fontSize.md,
  },
});

export default ReservationsList;
