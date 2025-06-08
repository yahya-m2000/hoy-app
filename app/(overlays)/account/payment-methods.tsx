/**
 * Payment Methods Screen for the Hoy application
 * Allows users to manage their payment methods
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme, useToast } from "@shared/context";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize, fontWeight, spacing, radius } from "@shared/constants";

import { CustomHeader } from "@shared/components";

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  last4?: string;
  cardType?: string;
  email?: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const [isLoading] = useState(false);

  // Mock payment methods data
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      last4: "4242",
      cardType: "Visa",
      isDefault: true,
    },
    {
      id: "2",
      type: "paypal",
      email: "user@example.com",
      isDefault: false,
    },
  ]);

  const handleAddPaymentMethod = () => {
    // TODO: Navigate to add payment method screen
    console.log("Add payment method");
  };

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement payment method deletion
            console.log("Delete payment method:", id);
            showToast({
              message: "Payment method deleted",
              type: "success",
            });
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    // TODO: Implement set as default
    console.log("Set as default:", id);
    showToast({
      message: "Default payment method updated",
      type: "success",
    });
  };

  const renderPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case "card":
        return "card-outline";
      case "paypal":
        return "logo-paypal";
      case "bank":
        return "business-outline";
      default:
        return "card-outline";
    }
  };

  const renderPaymentMethodTitle = (method: PaymentMethod) => {
    switch (method.type) {
      case "card":
        return `${method.cardType} •••• ${method.last4}`;
      case "paypal":
        return `PayPal - ${method.email}`;
      case "bank":
        return "Bank Account";
      default:
        return "Payment Method";
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View
      key={method.id}
      style={[styles.paymentMethod, { backgroundColor: theme.surface }]}
    >
      <View style={styles.paymentMethodLeft}>
        <Ionicons
          name={renderPaymentMethodIcon(method) as any}
          size={24}
          color={theme.text.primary}
          style={styles.paymentMethodIcon}
        />
        <View style={styles.paymentMethodInfo}>
          <Text
            style={[styles.paymentMethodTitle, { color: theme.text.primary }]}
          >
            {renderPaymentMethodTitle(method)}
          </Text>
          {method.isDefault && (
            <Text style={[styles.defaultLabel, { color: theme.primary }]}>
              Default
            </Text>
          )}
        </View>
      </View>
      <View style={styles.paymentMethodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>
              Set Default
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePaymentMethod(method.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <CustomHeader title="Payment Methods" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            Loading payment methods...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <CustomHeader title="Payment Methods" showBackButton />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Saved Payment Methods
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={handleAddPaymentMethod}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length > 0 ? (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="card-outline"
                size={64}
                color={theme.text.secondary}
              />
              <Text
                style={[styles.emptyStateTitle, { color: theme.text.primary }]}
              >
                No Payment Methods
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: theme.text.secondary },
                ]}
              >
                Add a payment method to start making bookings
              </Text>
              <TouchableOpacity
                style={[
                  styles.addFirstButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleAddPaymentMethod}
              >
                <Text style={styles.addFirstButtonText}>
                  Add Payment Method
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={theme.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
              Secure & Protected
            </Text>
            <Text
              style={[styles.infoSubtitle, { color: theme.text.secondary }]}
            >
              Your payment information is encrypted and stored securely. We
              never store your full card details.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    color: "white",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  paymentMethodsList: {
    gap: spacing.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodIcon: {
    marginRight: spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  defaultLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  paymentMethodActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptyStateSubtitle: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  addFirstButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  addFirstButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  infoSection: {
    flexDirection: "row",
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  infoSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
});
