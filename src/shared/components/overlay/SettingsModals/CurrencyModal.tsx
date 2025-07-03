/**
 * Currency Modal Component
 * Handles currency selection and settings
 * Converted from route-based overlay to standalone modal component
 */

import React, { useState, useEffect } from "react";
import { Modal, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context and hooks
import { useTheme } from "@core/hooks/useTheme";
import { useCurrency } from "@core/context/CurrencyContext";

// Components
import { Container } from "../../layout";
import { Button } from "../../base/Button";
import { Text } from "../../base/Text";
import { Ionicons } from "@expo/vector-icons";

// Constants
import { fontSize, spacing } from "@core/design";

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
      Alert.alert("Error", "Failed to change currency. Please try again.");
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
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: isSelected ? "600" : "400",
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
              marginBottom: 2,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            }}
          >
            {item.code} • {item.symbol}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
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
      <View style={{ width: 40 }} />
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: "600",
          color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
        }}
      >
        Currency
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        }
      />
    </Container>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <ModalHeader />

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
