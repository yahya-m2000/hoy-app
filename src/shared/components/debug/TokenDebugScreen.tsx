import React, { useState } from "react";
import { View, StyleSheet, Button, ScrollView } from "react-native";
import { Text } from "../base/Text";
// Note: validateTokenRefreshFlow import removed due to missing module
// import { validateTokenRefreshFlow } from "@core/services/core/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Component to test and validate the token refresh flow
 */
const TokenDebugScreen = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTokenValidation = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: validateTokenRefreshFlow function not available
      throw new Error("validateTokenRefreshFlow function not available");
    } catch (err) {
      setError(
        `Error running validation: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      setResults(null);
      setError(null);
      alert("Tokens cleared successfully");
    } catch (err) {
      setError(
        `Error clearing tokens: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearDebugInfo = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("lastTokenRefreshAttempt");
      await AsyncStorage.removeItem("lastTokenRefreshSuccess");
      await AsyncStorage.removeItem("lastTokenRefreshFailure");
      await AsyncStorage.removeItem("tokenMetadata");
      await AsyncStorage.removeItem("tokenRefreshFailCount");
      setResults(null);
      setError(null);
      alert("Debug info cleared successfully");
    } catch (err) {
      setError(
        `Error clearing debug info: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTokenStatus = () => {
    if (!results) return null;

    const {
      accessTokenValid,
      accessTokenExpiry,
      refreshSuccess,
      apiCallSuccess,
    } = results;

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Token Status</Text>

        <Text style={styles.statusItem}>
          Access Token: {results.hasAccessToken ? "✅" : "❌"}
        </Text>

        <Text style={styles.statusItem}>
          Refresh Token: {results.hasRefreshToken ? "✅" : "❌"}
        </Text>

        <Text style={styles.statusItem}>
          Access Token Valid: {accessTokenValid ? "✅" : "❌"}
          {accessTokenExpiry?.expiresInMinutes &&
            ` (Expires in ${accessTokenExpiry.expiresInMinutes} minutes)`}
        </Text>

        <Text style={styles.statusItem}>
          Refresh Success: {refreshSuccess ? "✅" : "❌"}
        </Text>

        <Text style={styles.statusItem}>
          API Call Success: {apiCallSuccess ? "✅" : "❌"}
        </Text>

        {results.userData && (
          <View style={styles.userData}>
            <Text style={styles.statusSubtitle}>User Data:</Text>
            <Text>ID: {results.userData.userId}</Text>
            <Text>Email: {results.userData.email}</Text>
            <Text>Name: {results.userData.name}</Text>
          </View>
        )}

        {results.errors && results.errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={styles.statusSubtitle}>Errors:</Text>
            {results.errors.map((err: any, index: number) => (
              <Text key={index} style={styles.errorItem}>
                {err.stage}: {err.error}
              </Text>
            ))}
          </View>
        )}

        {results.debugInfo && (
          <View style={styles.debugInfo}>
            <Text style={styles.statusSubtitle}>Debug Info:</Text>
            <Text>
              Last Attempt: {results.debugInfo.lastRefreshAttempt || "None"}
            </Text>
            <Text>
              Last Success: {results.debugInfo.lastRefreshSuccess || "None"}
            </Text>
            <Text>Fail Count: {results.debugInfo.failCount}</Text>
            <Text>Device: {results.debugInfo.deviceInfo?.deviceName}</Text>
            <Text>App Version: {results.debugInfo.deviceInfo?.appVersion}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Token Refresh Debug</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Token Refresh"
          onPress={runTokenValidation}
          disabled={loading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Clear Tokens"
          onPress={clearTokens}
          disabled={loading}
          color="#ff6347" // tomato color for warning action
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Clear Debug Info"
          onPress={clearDebugInfo}
          disabled={loading}
          color="#ff8c00" // dark orange
        />
      </View>

      {loading && <Text style={styles.loading}>Loading...</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      {renderTokenStatus()}

      {results && (
        <View style={styles.rawDataContainer}>
          <Text style={styles.statusSubtitle}>Raw Results:</Text>
          <Text style={styles.rawData}>{JSON.stringify(results, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 10,
  },
  loading: {
    textAlign: "center",
    marginVertical: 10,
    fontStyle: "italic",
  },
  error: {
    color: "red",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#ffeeee",
    borderRadius: 5,
  },
  statusContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  statusItem: {
    fontSize: 15,
    marginBottom: 8,
  },
  userData: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  errorsContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  errorItem: {
    color: "red",
    marginBottom: 5,
  },
  debugInfo: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rawDataContainer: {
    marginTop: 20,
  },
  rawData: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
});

export default TokenDebugScreen;
