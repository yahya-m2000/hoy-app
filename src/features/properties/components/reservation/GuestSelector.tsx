/**
 * Guest Selector component for Property Reservations
 * Refactored to use shared base components
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Shared components
import { Container, Text } from "@shared/components";

// Context & Hooks
import { useTheme } from "src/core/hooks/useTheme";

interface GuestSelectorProps {
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeAdults: (value: number) => void;
  onChangeChildren: (value: number) => void;
  onChangeInfants: (value: number) => void;
  onChangePets: (value: number) => void;
  maxGuests?: number;
  maxInfants?: number;
  maxPets?: number;
}

interface GuestRowProps {
  title: string;
  description: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  minValue?: number;
}

const GuestRow: React.FC<GuestRowProps> = ({
  title,
  description,
  value,
  onDecrease,
  onIncrease,
  disabled = false,
  minValue = 0,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="lg"
      borderBottomWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
    >
      <Container flex={1}>
        <Container marginBottom="xs">
          <Text
            variant="body"
            weight="semibold"
            color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          >
            {title}
          </Text>
        </Container>
        <Text
          variant="caption"
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
        >
          {description}
        </Text>
      </Container>

      <Container flexDirection="row" alignItems="center">
        <TouchableOpacity
          onPress={onDecrease}
          disabled={disabled || value <= minValue}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor:
              disabled || value <= minValue
                ? isDark
                  ? theme.colors.gray[600]
                  : theme.colors.gray[300]
                : theme.colors.primary,

            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <Ionicons
            name="remove"
            size={20}
            color={
              disabled || value <= minValue
                ? isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
                : theme.colors.primary
            }
          />
        </TouchableOpacity>

        <Container
          width={48}
          alignItems="center"
          paddingVertical="sm"
          paddingHorizontal="md"
          borderRadius="md"
        >
          <Text
            variant="body"
            weight="bold"
            color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          >
            {value}
          </Text>
        </Container>

        <TouchableOpacity
          onPress={onIncrease}
          disabled={disabled}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: disabled
              ? isDark
                ? theme.colors.gray[600]
                : theme.colors.gray[300]
              : theme.colors.primary,

            alignItems: "center",
            justifyContent: "center",
            marginLeft: 16,
          }}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              disabled
                ? isDark
                  ? theme.colors.gray[500]
                  : theme.colors.gray[400]
                : theme.colors.primary
            }
          />
        </TouchableOpacity>
      </Container>
    </Container>
  );
};

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  adults,
  childrenCount,
  infants,
  pets,
  onChangeAdults,
  onChangeChildren,
  onChangeInfants,
  onChangePets,
  maxGuests = 16,
  maxInfants = 5,
  maxPets = 3,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const totalGuests = adults + childrenCount;
  const isAtMaxGuests = totalGuests >= maxGuests;

  return (
    <Container>
      <Container>
        <GuestRow
          title={t("reservation.adults", "Adults")}
          description={t("reservation.adultsDescription", "Ages 13 or above")}
          value={adults}
          onDecrease={() => onChangeAdults(Math.max(1, adults - 1))}
          onIncrease={() => onChangeAdults(adults + 1)}
          disabled={isAtMaxGuests && adults >= maxGuests}
          minValue={1}
        />

        <GuestRow
          title={t("reservation.children", "Children")}
          description={t("reservation.childrenDescription", "Ages 2-12")}
          value={childrenCount}
          onDecrease={() => onChangeChildren(Math.max(0, childrenCount - 1))}
          onIncrease={() => onChangeChildren(childrenCount + 1)}
          disabled={isAtMaxGuests}
        />

        <GuestRow
          title={t("reservation.infants", "Infants")}
          description={t("reservation.infantsDescription", "Under 2")}
          value={infants}
          onDecrease={() => onChangeInfants(Math.max(0, infants - 1))}
          onIncrease={() => onChangeInfants(infants + 1)}
          disabled={infants >= maxInfants}
        />

        <GuestRow
          title={t("reservation.pets", "Pets")}
          description={t(
            "reservation.petsDescription",
            "Bringing a service animal?"
          )}
          value={pets}
          onDecrease={() => onChangePets(Math.max(0, pets - 1))}
          onIncrease={() => onChangePets(pets + 1)}
          disabled={pets >= maxPets}
        />
      </Container>

      {isAtMaxGuests && (
        <Container
          marginTop="md"
          padding="md"
          borderRadius="lg"
          backgroundColor={
            isDark ? theme.colors.error + "20" : theme.colors.error + "10"
          }
          borderWidth={1}
          borderColor={
            isDark ? theme.colors.error + "30" : theme.colors.error + "20"
          }
        >
          <Text variant="caption" color="error" weight="semibold">
            {t(
              "reservation.maxGuestsReached",
              `Maximum ${maxGuests} guests allowed`
            )}
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default GuestSelector;
