/**
 * Currency Modal Component
 * Handles currency selection and settings
 * Converted from route-based overlay to standalone modal component
 */

import React, { useState, useEffect } from "react";
import { Modal, FlatList, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

// Context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useCurrency } from "@core/context/CurrencyContext";

// Components
import { Container, Text, Button, Icon, Header } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";

// Constants
import { fontSize, spacing, iconSize } from "@core/design";

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  onCurrencySelected?: (currency: string) => void;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export default function CurrencyModal({
  visible,
  onClose,
  onCurrencySelected,
}: CurrencyModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentCurrency, changeCurrency, supportedCurrencies } =
    useCurrency();

  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedCurrency(currentCurrency);
  }, [currentCurrency]);

  const handleCurrencySelect = async (currencyCode: string) => {
    try {
      setIsLoading(true);
      setSelectedCurrency(currencyCode);

      await changeCurrency(currencyCode);

      if (onCurrencySelected) {
        onCurrencySelected(currencyCode);
      }

      onClose();
    } catch (error) {
      console.error("Failed to change currency:", error);
      Alert.alert(
        t("common.error"),
        t("profile.currencyChangeError", {
          defaultValue: "Failed to change currency. Please try again.",
        })
      );
      setSelectedCurrency(currentCurrency); // Reset selection
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyOption }) => {
    const isSelected = item.code === selectedCurrency;

    return (
      <TouchableOpacity
        onPress={() => handleCurrencySelect(item.code)}
        disabled={isLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: isSelected
            ? isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100]
            : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        }}
        activeOpacity={0.7}
      >
        <Container flexDirection="row" alignItems="center" flex={1}>
          <Text variant="h6" color="primary" weight="bold" marginRight="md">
            {item.symbol}
          </Text>
          <Container flex={1}>
            <Text
              size="md"
              weight={isSelected ? "semibold" : "normal"}
              color="primary"
              style={{ marginBottom: 2 }}
            >
              {item.name}
            </Text>
            <Text size="sm" weight="normal" color="secondary">
              {item.code.toUpperCase()}
            </Text>
          </Container>
        </Container>

        {isSelected && (
          <Icon
            name="checkmark"
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const ModalHeader = () => (
    <Container
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="lg"
      paddingVertical="md"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.gray[700]
          : theme.colors.gray[200],
      }}
    >
      <Container style={{ width: 40 }}>
        <></>
      </Container>
      <Text variant="h6" weight="semibold" color="primary">
        {t("profile.selectCurrency")}
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        size="small"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons name="close" size={24} color={theme.colors.gray[400]} />
        }
      />
    </Container>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <Header
          title={t("profile.selectCurrency")}
          left={{
            icon: "close",
            onPress: onClose,
          }}
        />

        <Container flex={1} style={{ paddingBottom: insets.bottom }}>
          <FlatList
            data={supportedCurrencies}
            keyExtractor={(item) => item.code}
            renderItem={renderCurrencyItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
          />
        </Container>
      </Container>
    </Modal>
  );
}
