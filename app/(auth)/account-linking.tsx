/**
 * Account Linking Screen
 *
 * Handles the flow when a user tries to sign in with a different SSO provider
 * but the email already exists in the system. Allows users to link accounts.
 */

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context and hooks
import { useAuth, useToast } from "@core/context";
import { useTheme } from "@core/hooks/useTheme";
import { AuthService } from "@core/api/services/auth";
import {
  saveTokenToStorage,
  saveRefreshTokenToStorage,
  clearTokenInvalidation,
} from "@core/auth/storage";
import { setUserIdentity } from "@core/utils/data/validation/integrity-check";

// Base Components
import { Text, Button, Input } from "src/shared/components/base";
import { Container, Header, Screen } from "src/shared";

interface LinkingData {
  existingUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    existingProviders: string[];
  };
  newProvider: string;
  ssoId: string;
  profilePicture?: string;
}

export default function AccountLinkingScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();
  const { markAsAuthenticated } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [linkingData, setLinkingData] = useState<LinkingData | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load linking data on mount
  useEffect(() => {
    loadLinkingData();
  }, []);

  const loadLinkingData = async () => {
    try {
      const data = await AsyncStorage.getItem("ssoLinkingData");
      if (data) {
        const parsedData = JSON.parse(data);
        setLinkingData(parsedData);
      } else {
        // No linking data found, navigate to sign in
        router.push("/(auth)/sign-in");
      }
    } catch (error) {
      console.error("Error loading linking data:", error);
      router.push("/(auth)/sign-in");
    }
  };

  const handleLinkAccount = async () => {
    if (!linkingData || !password.trim()) {
      showToast({
        type: "error",
        message: t("auth.passwordRequired"),
      });
      return;
    }

    setLoading(true);

    try {
      // First, verify the password by attempting to login
      const loginResponse = await AuthService.login({
        email: linkingData.existingUser.email,
        password: password,
      });

      // If login successful, proceed with linking
      const linkResponse = await AuthService.linkSsoAccount({
        userId: linkingData.existingUser.id,
        provider: linkingData.newProvider as "google" | "facebook",
        ssoId: linkingData.ssoId,
        profilePicture: linkingData.profilePicture,
      });

      // Store tokens from linking response
      if (linkResponse.accessToken) {
        await saveTokenToStorage(linkResponse.accessToken);
      }

      if (linkResponse.refreshToken) {
        await saveRefreshTokenToStorage(linkResponse.refreshToken);
      }

      // Clear any previous token invalidation
      await clearTokenInvalidation();

      // Store user ID and identity
      const userId = linkResponse.user.id || (linkResponse.user as any)._id;
      await AsyncStorage.setItem("currentUserId", userId);
      await setUserIdentity(userId, linkResponse.user.email);

      // Mark user as authenticated in AuthContext
      markAsAuthenticated(linkResponse.user);

      // Clear linking data
      await AsyncStorage.removeItem("ssoLinkingData");

      showToast({
        type: "success",
        message: t("auth.accountLinkedSuccessfully"),
      });

      router.back();
    } catch (error: any) {
      console.error("Account linking error:", error);

      if (error.message === "Invalid email or password") {
        showToast({
          type: "error",
          message: t("auth.invalidPassword"),
        });
      } else {
        showToast({
          type: "error",
          message: error.message || t("auth.accountLinkingFailed"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Clear linking data and navigate to sign in (maintains back stack)
    await AsyncStorage.removeItem("ssoLinkingData");
    router.push("/(auth)/sign-in");
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "facebook":
        return "Facebook";
      default:
        return provider;
    }
  };

  if (!linkingData) {
    return (
      <Container flex={1}>
        <Header
          title={t("auth.accountLinking")}
          left={{
            icon: "chevron-back-outline",
            onPress: handleCancel,
          }}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <Text variant="body" color="secondary">
            {t("common.loading")}...
          </Text>
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1}>
      <Header
        title={t("auth.accountLinking")}
        left={{
          icon: "chevron-back-outline",
          onPress: handleCancel,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Container flex={1} padding="lg">
            {/* Account Linking Info */}
            <Container
              marginBottom="lg"
              padding="lg"
              backgroundColor="primary"
              borderRadius="md"
            >
              <Text variant="h6" color="white" align="center" marginBottom="md">
                {t("auth.accountLinkingTitle")}
              </Text>

              <Text
                variant="body"
                color="white"
                align="center"
                marginBottom="md"
              >
                {t("auth.accountLinkingDescription", {
                  email: linkingData.existingUser.email,
                  newProvider: getProviderDisplayName(linkingData.newProvider),
                })}
              </Text>

              <Container
                marginTop="md"
                padding="md"
                backgroundColor="rgba(255,255,255,0.1)"
                borderRadius="sm"
              >
                <Text variant="body" color="white" marginBottom="sm">
                  <Text
                    variant="body"
                    color="white"
                    style={{ fontWeight: "bold" }}
                  >
                    {t("auth.existingAccount")}:
                  </Text>
                </Text>
                <Text variant="body" color="white" marginBottom="sm">
                  {linkingData.existingUser.firstName}{" "}
                  {linkingData.existingUser.lastName}
                </Text>
                <Text variant="body" color="white" marginBottom="sm">
                  {linkingData.existingUser.email}
                </Text>
                {linkingData.existingUser.existingProviders.length > 0 && (
                  <Text variant="body" color="white">
                    {t("auth.connectedProviders")}:{" "}
                    {linkingData.existingUser.existingProviders
                      .map(getProviderDisplayName)
                      .join(", ")}
                  </Text>
                )}
              </Container>
            </Container>

            {/* Password Verification */}
            <Container marginBottom="lg">
              <Text variant="h6" color="primary" marginBottom="md">
                {t("auth.verifyPassword")}
              </Text>

              <Text variant="body" color="secondary" marginBottom="md">
                {t("auth.verifyPasswordDescription", {
                  newProvider: getProviderDisplayName(linkingData.newProvider),
                })}
              </Text>

              <Input
                label={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.enterPassword")}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={{ marginBottom: 24 }}
                textContentType="password"
                autoComplete="password"
              />

              <Button
                title={t("auth.linkAccount")}
                onPress={handleLinkAccount}
                loading={loading}
                variant="primary"
                style={{ marginBottom: 16 }}
              />

              <Button
                title={t("common.cancel")}
                variant="ghost"
                onPress={handleCancel}
                style={{ alignSelf: "center" }}
              />
            </Container>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
