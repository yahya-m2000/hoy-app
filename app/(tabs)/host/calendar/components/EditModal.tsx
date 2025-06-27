import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
} from "react-native";
import { format } from "date-fns";

interface EditModalProps {
  visible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onClose: () => void;
  onSave: (data: {
    startDate: Date;
    endDate: Date;
    price: number;
    isAvailable: boolean;
  }) => void;
}

const { height: screenHeight } = Dimensions.get("window");

export const EditModal: React.FC<EditModalProps> = ({
  visible,
  startDate,
  endDate,
  onClose,
  onSave,
}) => {
  const [price, setPrice] = useState("120");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (visible) {
      // Reset to default values when modal opens
      setPrice("120");
      setIsAvailable(true);
    }
  }, [visible]);
  const formatDateRange = () => {
    if (!startDate) return "";
    if (
      !endDate ||
      (startDate && endDate && startDate.getTime() === endDate.getTime())
    ) {
      return format(startDate, "MMM d, yyyy");
    }
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const handleSave = () => {
    if (!startDate || !endDate) return;

    const priceNumber = parseFloat(price) || 120;
    onSave({
      startDate,
      endDate,
      price: priceNumber,
      isAvailable,
    });
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Dates</Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Date Range */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Dates</Text>
                <View style={styles.dateRangeContainer}>
                  <Text style={styles.dateRangeText}>{formatDateRange()}</Text>
                </View>
              </View>

              {/* Price */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price per night</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="120"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Availability */}
              <View style={styles.section}>
                <View style={styles.availabilityRow}>
                  <View style={styles.availabilityText}>
                    <Text style={styles.sectionTitle}>
                      Available for booking
                    </Text>
                    <Text style={styles.availabilitySubtext}>
                      {isAvailable
                        ? "Guests can book these dates"
                        : "Dates are blocked"}
                    </Text>
                  </View>
                  <Switch
                    value={isAvailable}
                    onValueChange={setIsAvailable}
                    trackColor={{ false: "#E0E0E0", true: "#007AFF" }}
                    thumbColor={isAvailable ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>

              {/* Apply to Range Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  Changes will be applied to all selected dates
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: screenHeight * 0.6,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    flex: 1,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  dateRangeContainer: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 8,
  },
  dateRangeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    padding: 0,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  availabilityText: {
    flex: 1,
  },
  availabilitySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
  },
});
