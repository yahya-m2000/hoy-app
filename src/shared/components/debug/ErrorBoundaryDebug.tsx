/**
 * Error Boundary Debug Component
 *
 * Debug component for testing error boundaries and context error handling.
 * Provides buttons to trigger different types of errors to verify error boundaries work correctly.
 *
 * @module @shared/components/debug/ErrorBoundaryDebug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "@core/context/AuthContext";
import { useNetwork } from "@core/context/NetworkContext";
import { useToast } from "@core/context/ToastContext";
import { useCurrency } from "@core/context/CurrencyContext";
import { useUserRole } from "@core/context/UserRoleContext";

interface ErrorBoundaryDebugProps {
  onClose?: () => void;
}

export const ErrorBoundaryDebug: React.FC<ErrorBoundaryDebugProps> = ({
  onClose,
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Context hooks
  const auth = useAuth();
  const network = useNetwork();
  const toast = useToast();
  const currency = useCurrency();
  const userRole = useUserRole();

  // Error triggering functions
  const triggerRenderError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Render Error");
    // This will cause a render error
    throw new Error("Test render error from ErrorBoundaryDebug");
  }, []);

  const triggerAsyncError = useCallback(async () => {
    setErrorCount((prev) => prev + 1);
    setLastError("Async Error");
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Test async error")), 100);
      });
    } catch (error) {
      console.error("Async error caught:", error);
      throw error;
    }
  }, []);

  const triggerContextError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Context Error");
    try {
      // Try to access context method that might fail
      (auth as any).nonExistentMethod();
    } catch (error) {
      console.error("Context error:", error);
      throw new Error("Test context error");
    }
  }, [auth]);

  const triggerNetworkError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Network Error");
    try {
      // Try to access network method that might fail
      (network as any).invalidNetworkOperation();
    } catch (error) {
      console.error("Network error:", error);
      throw new Error("Test network context error");
    }
  }, [network]);

  const triggerToastError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Toast Error");
    try {
      // Try to show invalid toast
      (toast as any).showInvalidToast({ invalid: true });
    } catch (error) {
      console.error("Toast error:", error);
      throw new Error("Test toast context error");
    }
  }, [toast]);

  const triggerCurrencyError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Currency Error");
    try {
      // Try to set invalid currency
      (currency as any).setInvalidCurrency(null);
    } catch (error) {
      console.error("Currency error:", error);
      throw new Error("Test currency context error");
    }
  }, [currency]);

  const triggerUserRoleError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("UserRole Error");
    try {
      // Try to set invalid user role
      (userRole as any).setInvalidRole("invalid_role");
    } catch (error) {
      console.error("UserRole error:", error);
      throw new Error("Test user role context error");
    }
  }, [userRole]);

  const triggerMemoryError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setLastError("Memory Error");
    // Create a large array to simulate memory issues
    const largeArray = new Array(1000000).fill("memory test");
    try {
      // Try to process the large array in a way that might cause issues
      largeArray.forEach((item, index) => {
        if (index > 999990) {
          throw new Error("Test memory error");
        }
      });
    } catch (error) {
      console.error("Memory error:", error);
      throw error;
    }
  }, []);

  const testErrorRecovery = useCallback(() => {
    setErrorCount(0);
    setLastError(null);
    toast.showToast({
      message: "Error recovery test completed",
      type: "success",
    });
  }, [toast]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Error Boundary Debug</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>Errors Triggered: {errorCount}</Text>
        {lastError && (
          <Text style={styles.lastErrorText}>Last Error: {lastError}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Render Errors</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerRenderError}
        >
          <Text style={styles.errorButtonText}>Trigger Render Error</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerAsyncError}
        >
          <Text style={styles.errorButtonText}>Trigger Async Error</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerMemoryError}
        >
          <Text style={styles.errorButtonText}>Trigger Memory Error</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context Errors</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerContextError}
        >
          <Text style={styles.errorButtonText}>Trigger Auth Context Error</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerNetworkError}
        >
          <Text style={styles.errorButtonText}>
            Trigger Network Context Error
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerToastError}
        >
          <Text style={styles.errorButtonText}>
            Trigger Toast Context Error
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerCurrencyError}
        >
          <Text style={styles.errorButtonText}>
            Trigger Currency Context Error
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={triggerUserRoleError}
        >
          <Text style={styles.errorButtonText}>
            Trigger UserRole Context Error
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Recovery</Text>
        <TouchableOpacity
          style={styles.recoveryButton}
          onPress={testErrorRecovery}
        >
          <Text style={styles.recoveryButtonText}>Test Error Recovery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How to Test:</Text>
        <Text style={styles.infoText}>
          1. Tap any error button to trigger that type of error{"\n"}
          2. Observe how the error boundary handles the error{"\n"}
          3. Check if the app remains functional{"\n"}
          4. Use &ldquo;Test Error Recovery&rdquo; to reset the error count
          {"\n"}
          5. Check console logs for detailed error information
        </Text>
      </View>

      <View style={styles.contextStatus}>
        <Text style={styles.sectionTitle}>Context Status</Text>
        <Text style={styles.statusText}>
          Auth: {auth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </Text>
        <Text style={styles.statusText}>
          Network: {network.isConnected ? "Connected" : "Disconnected"}
        </Text>
        <Text style={styles.statusText}>Currency: {currency.currency}</Text>
        <Text style={styles.statusText}>User Role: {userRole.userRole}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  stats: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  lastErrorText: {
    fontSize: 14,
    color: "#ff4444",
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  errorButton: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  recoveryButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
  },
  recoveryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  info: {
    padding: 20,
    backgroundColor: "#e3f2fd",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
  contextStatus: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
});
