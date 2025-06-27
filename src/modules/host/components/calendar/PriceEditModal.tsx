/**
 * Price Edit Modal
 * Modal for editing nightly rates with currency support
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { formatPrice } from "../../utils/calendarUtils";

interface PriceEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (newPrice: number) => void;
  currentPrice: number;
  currency: string;
  selectedDates: string[];
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
  isVisible,
  onClose,
  onSave,
  currentPrice,
  currency,
  selectedDates,
}) => {
  const theme = useTheme();
  const [priceInput, setPriceInput] = useState(currentPrice.toString());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setPriceInput(currentPrice.toString());
  }, [currentPrice, isVisible]);

  const validatePrice = (price: string) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  };

  const handlePriceChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, "");
    setPriceInput(cleanText);
    setIsValid(validatePrice(cleanText));
  };

  const handleSave = () => {
    const newPrice = parseFloat(priceInput);

    if (!validatePrice(priceInput)) {
      Alert.alert("Invalid Price", "Please enter a valid price greater than 0");
      return;
    }

    onSave(newPrice);
    onClose();
  };

  const formatSelectedDatesText = () => {
    if (selectedDates.length === 1) {
      const date = new Date(selectedDates[0]);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
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

    return `${selectedDates.length} selected dates`;
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
      JPY: "¥",
    };
    return symbols[currencyCode] || currencyCode;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </Pressable>

          <Text style={[styles.title, { color: theme.text.primary }]}>
            Edit Price
          </Text>

          <Pressable
            onPress={handleSave}
            style={[
              styles.saveButton,
              {
                backgroundColor: isValid
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            disabled={!isValid}
          >
            <Text
              style={[
                styles.saveText,
                {
                  color: isValid ? theme.colors.white : theme.text.disabled,
                },
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Selected dates info */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>
              Selected dates
            </Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>
              {formatSelectedDatesText()}
            </Text>
          </View>

          {/* Current price info */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: theme.text.secondary }]}>
              Current price per night
            </Text>
            <Text style={[styles.currentPrice, { color: theme.text.primary }]}>
              {formatPrice(currentPrice, currency)}
            </Text>
          </View>

          {/* Price input */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.text.primary }]}>
              New price per night
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isValid
                    ? theme.colors.border
                    : theme.colors.error,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Text
                style={[styles.currencySymbol, { color: theme.text.secondary }]}
              >
                {getCurrencySymbol(currency)}
              </Text>

              <TextInput
                style={[styles.priceInput, { color: theme.text.primary }]}
                value={priceInput}
                onChangeText={handlePriceChange}
                placeholder="0.00"
                placeholderTextColor={theme.text.disabled}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />

              <Text
                style={[styles.currencyCode, { color: theme.text.secondary }]}
              >
                {currency}
              </Text>
            </View>

            {!isValid && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Please enter a valid price
              </Text>
            )}
          </View>

          {/* Preview */}
          {isValid && (
            <View
              style={[
                styles.previewSection,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.previewLabel, { color: theme.text.secondary }]}
              >
                New price preview
              </Text>
              <Text
                style={[styles.previewPrice, { color: theme.colors.primary }]}
              >
                {formatPrice(parseFloat(priceInput) || 0, currency)} per night
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: "600",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  previewSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default PriceEditModal;
