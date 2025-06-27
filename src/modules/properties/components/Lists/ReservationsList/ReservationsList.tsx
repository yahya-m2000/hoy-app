/**
 * ReservationsList Component
 * Displays upcoming reservations for host dashboard
 */
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@shared/hooks/useTheme";
import { DetailCard as Card, Avatar, Container } from "@shared/components";
import { EmptyState } from "@shared/components/common";

import { spacing, fontSize, radius } from "@shared/constants";

import { RecentReservation } from "@shared/types";
import type { ReservationsListProps } from "../../types/lists";

const ReservationsList = ({
  isLoading,
  reservations,
}: ReservationsListProps) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  // Helper functions for formatting dates and calculating nights
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateDays = (checkIn: string, checkOut: string) => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : reservations && reservations.length > 0 ? (
        <Container>
          {reservations.slice(0, 3).map((reservation) => (
            <TouchableOpacity
              key={reservation.id}
              style={[
                styles.reservationItem,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                },
              ]}
              onPress={() =>
                router.push(`/(tabs)/host/reservations/${reservation.id}`)
              }
            >
              <View style={styles.reservationHeader}>
                <View style={styles.propertyInfo}>
                  <Text
                    style={[
                      styles.propertyName,
                      {
                        color: isDark ? theme.colors.white : theme.colors.black,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {reservation.propertyTitle}
                  </Text>
                  <View style={styles.dateInfo}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={
                        isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                      }
                      style={styles.dateIcon}
                    />
                    <Text
                      style={[
                        styles.dates,
                        {
                          color: isDark
                            ? theme.colors.gray[400]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      {formatDate(reservation.checkIn)} -
                      {formatDate(reservation.checkOut)} (
                      {calculateDays(reservation.checkIn, reservation.checkOut)}
                      {t("common.nights")})
                    </Text>
                  </View>
                </View>
                <View style={styles.guestInfo}>
                  <Avatar
                    size="small"
                    source={reservation.guestPhoto}
                    name={reservation.guestName}
                  />
                  <Text
                    style={[
                      styles.guestName,
                      {
                        color: isDark
                          ? theme.colors.gray[300]
                          : theme.colors.gray[700],
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {reservation.guestName}
                  </Text>
                </View>
              </View>

              <View style={styles.reservationFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        reservation.status === "confirmed"
                          ? theme.colors.success + "20"
                          : reservation.status === "pending"
                          ? theme.colors.warning + "20"
                          : theme.colors.error + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          reservation.status === "confirmed"
                            ? theme.colors.success
                            : reservation.status === "pending"
                            ? theme.colors.warning
                            : theme.colors.error,
                      },
                    ]}
                  >
                    {t(`common.status.${reservation.status}`)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/host/reservations")}
          >
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
              {t("host.viewAllReservations")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </Container>
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={t("host.noReservations")}
          message={t("host.noReservationsMessage")}
          action={{
            label: t("host.viewCalendar"),
            onPress: () => router.push("/host/calendar"),
          }}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  reservationItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  propertyInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  propertyName: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: spacing.xs,
  },
  dates: {
    fontSize: fontSize.sm,
  },
  guestInfo: {
    alignItems: "center",
  },
  guestName: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    maxWidth: 70,
    textAlign: "center",
  },
  reservationFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    margin: spacing.md,
  },
  viewAllText: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
});

export default ReservationsList;
