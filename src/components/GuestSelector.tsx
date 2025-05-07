/**
 * Guest Selector component for the Hoy application
 * Allows users to select number of guests for a reservation
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";

interface GuestSelectorProps {
  adults: number;
  children: number;
  infants: number;
  pets?: number;
  onChangeAdults: (value: number) => void;
  onChangeChildren: (value: number) => void;
  onChangeInfants: (value: number) => void;
  onChangePets?: (value: number) => void;
  maxGuests?: number;
  maxInfants?: number;
  maxPets?: number;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({
  adults = 1,
  children = 0,
  infants = 0,
  pets = 0,
  onChangeAdults,
  onChangeChildren,
  onChangeInfants,
  onChangePets,
  maxGuests = 16,
  maxInfants = 5,
  maxPets = 3,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Calculate maximum allowed for each category
  const totalGuests = adults + children;
  const isMaxGuestsReached = totalGuests >= maxGuests;
  const isMaxInfantsReached = infants >= maxInfants;
  const isMaxPetsReached = pets >= maxPets;
  // Handle counter adjustments
  const handleIncrement = (
    type: "adults" | "children" | "infants" | "pets"
  ) => {
    if (type === "adults" && !isMaxGuestsReached) {
      onChangeAdults(adults + 1);
    } else if (type === "children" && !isMaxGuestsReached) {
      onChangeChildren(children + 1);
    } else if (type === "infants" && !isMaxInfantsReached) {
      onChangeInfants(infants + 1);
    } else if (type === "pets" && !isMaxPetsReached && onChangePets) {
      onChangePets(pets + 1);
    }
  };

  const handleDecrement = (
    type: "adults" | "children" | "infants" | "pets"
  ) => {
    if (type === "adults" && adults > 1) {
      onChangeAdults(adults - 1);
    } else if (type === "children" && children > 0) {
      onChangeChildren(children - 1);
    } else if (type === "infants" && infants > 0) {
      onChangeInfants(infants - 1);
    } else if (type === "pets" && pets > 0 && onChangePets) {
      onChangePets(pets - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? theme.colors.gray[200] : theme.colors.gray[800] },
        ]}
      >
        {t("reservation.guestCount")}
      </Text>

      {/* Maximum guests info */}
      <Text
        style={[
          styles.maxGuestsInfo,
          { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
        ]}
      >
        {t("reservation.maxGuestsInfo", { count: maxGuests })}
      </Text>

      {/* Adults */}
      <View
        style={[
          styles.guestRow,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <View style={styles.guestTypeContainer}>
          <Text
            style={[
              styles.guestTypeTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("reservation.adults")}
          </Text>
          <Text
            style={[
              styles.guestTypeSubtitle,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("reservation.age13Plus")}
          </Text>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor:
                  adults > 1
                    ? isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100]
                    : isDark
                    ? theme.colors.gray[900]
                    : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleDecrement("adults")}
            disabled={adults <= 1}
          >
            <Ionicons
              name="remove"
              size={22}
              color={
                adults > 1
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.counterValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {adults}
          </Text>

          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor: !isMaxGuestsReached
                  ? isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100]
                  : isDark
                  ? theme.colors.gray[900]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleIncrement("adults")}
            disabled={isMaxGuestsReached}
          >
            <Ionicons
              name="add"
              size={22}
              color={
                !isMaxGuestsReached
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Children */}
      <View
        style={[
          styles.guestRow,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <View style={styles.guestTypeContainer}>
          <Text
            style={[
              styles.guestTypeTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("reservation.children")}
          </Text>
          <Text
            style={[
              styles.guestTypeSubtitle,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("reservation.age2to12")}
          </Text>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor:
                  children > 0
                    ? isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100]
                    : isDark
                    ? theme.colors.gray[900]
                    : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleDecrement("children")}
            disabled={children <= 0}
          >
            <Ionicons
              name="remove"
              size={22}
              color={
                children > 0
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.counterValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {children}
          </Text>

          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor: !isMaxGuestsReached
                  ? isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100]
                  : isDark
                  ? theme.colors.gray[900]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleIncrement("children")}
            disabled={isMaxGuestsReached}
          >
            <Ionicons
              name="add"
              size={22}
              color={
                !isMaxGuestsReached
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Infants */}
      <View style={[styles.guestRow]}>
        <View style={styles.guestTypeContainer}>
          <Text
            style={[
              styles.guestTypeTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("reservation.infants")}
          </Text>
          <Text
            style={[
              styles.guestTypeSubtitle,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("reservation.under2")}
          </Text>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor:
                  infants > 0
                    ? isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100]
                    : isDark
                    ? theme.colors.gray[900]
                    : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleDecrement("infants")}
            disabled={infants <= 0}
          >
            <Ionicons
              name="remove"
              size={22}
              color={
                infants > 0
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.counterValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {infants}
          </Text>

          <TouchableOpacity
            style={[
              styles.counterButton,
              {
                backgroundColor: !isMaxInfantsReached
                  ? isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100]
                  : isDark
                  ? theme.colors.gray[900]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => handleIncrement("infants")}
            disabled={isMaxInfantsReached}
          >
            <Ionicons
              name="add"
              size={22}
              color={
                !isMaxInfantsReached
                  ? isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700]
                  : isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pets - only show if onChangePets is provided */}
      {onChangePets && (
        <View style={[styles.guestRow]}>
          <View style={styles.guestTypeContainer}>
            <Text
              style={[
                styles.guestTypeTitle,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("reservation.pets")}
            </Text>
            <Text
              style={[
                styles.guestTypeSubtitle,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("reservation.petsInfo")}
            </Text>
          </View>

          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor:
                    pets > 0
                      ? isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[100]
                      : isDark
                      ? theme.colors.gray[900]
                      : theme.colors.gray[200],
                },
              ]}
              onPress={() => handleDecrement("pets")}
              disabled={pets <= 0}
            >
              <Ionicons
                name="remove"
                size={22}
                color={
                  pets > 0
                    ? isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700]
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[400]
                }
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.counterValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {pets}
            </Text>

            <TouchableOpacity
              style={[
                styles.counterButton,
                {
                  backgroundColor: !isMaxPetsReached
                    ? isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100]
                    : isDark
                    ? theme.colors.gray[900]
                    : theme.colors.gray[200],
                },
              ]}
              onPress={() => handleIncrement("pets")}
              disabled={isMaxPetsReached}
            >
              <Ionicons
                name="add"
                size={22}
                color={
                  !isMaxPetsReached
                    ? isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700]
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[400]
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Special Requests */}
      <View style={styles.specialRequestsContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? theme.colors.gray[200] : theme.colors.gray[800] },
          ]}
        >
          {t("reservation.specialRequests")}
        </Text>
        <Text
          style={[
            styles.specialRequestsSubtitle,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
        >
          {t("reservation.specialRequestsHint")}
        </Text>
        <TextInput
          style={[
            styles.specialRequestsInput,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
              color: isDark ? theme.white : theme.colors.gray[900],
            },
          ]}
          placeholder={t("reservation.specialRequestsPlaceholder")}
          placeholderTextColor={
            isDark ? theme.colors.gray[500] : theme.colors.gray[400]
          }
          multiline={true}
          numberOfLines={4}
          maxLength={500}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  maxGuestsInfo: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  guestTypeContainer: {
    flex: 1,
  },
  guestTypeTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  guestTypeSubtitle: {
    fontSize: fontSize.sm,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: fontSize.md,
    fontWeight: "500",
    width: 36,
    textAlign: "center",
  },
  specialRequestsContainer: {
    marginTop: spacing.lg,
  },
  specialRequestsSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  specialRequestsInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default GuestSelector;
