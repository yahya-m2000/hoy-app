/**
 * Personal Information Screen for the Hoy application
 * Allows users to view and edit their personal information
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@common-context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
import { useCurrentUser, useUpdateProfile } from "@common-hooks/useUser";
import { useToast } from "@common-context/ToastContext";
import Avatar from "@common-components/Avatar";
import type { User } from "@common/types/user";

// Add additional user properties that are not in the User type
interface ExtendedUser extends User {
  phoneNumber?: string;
  isEmailVerified?: boolean;
}

export default function PersonalInfoScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: user, isLoading: userLoading, refetch } = useCurrentUser();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Populate form fields with user data when available
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      // Cast user to ExtendedUser to access additional properties
      const extendedUser = user as ExtendedUser;
      setPhoneNumber(extendedUser.phoneNumber || "");
      setIsVerified(extendedUser.isEmailVerified || false);
    }
  }, [user]);

  // Handle form submission
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast({
        type: "error",
        message: t("profile.requiredFields"),
      });
      return;
    }

    try {
      await updateProfile({
        firstName,
        lastName,
        phoneNumber,
      });

      showToast({
        type: "success",
        message: t("profile.updateSuccess"),
      });

      setIsEditing(false);
      refetch(); // Refresh user data
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast({
        type: "error",
        message: t("profile.updateError"),
      });
    }
  };
  // Reset form to original values and cancel editing
  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      // Cast user to ExtendedUser to access additional properties
      const extendedUser = user as ExtendedUser;
      setPhoneNumber(extendedUser.phoneNumber || "");
    }
    setIsEditing(false);
  };

  if (userLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700],
            },
          ]}
        >
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  const renderField = (
    label: string,
    value: string,
    onChangeText?: (text: string) => void,
    editable = true
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700],
            },
          ]}
        >
          {label}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[300],
              color: isDark ? theme.white : theme.colors.grayPalette[900],
            },
            !editable && {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.gray[100],
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={isEditing && editable}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700]}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.grayPalette[900],
            },
          ]}
        >
          {t("account.personalInfo")}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.editButtonText,
                { color: theme.colors.primary },
              ]}
            >
              {isEditing ? t("common.save") : t("common.edit")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Picture Section */}
      <View style={styles.profileSection}>
        <Avatar
          size="xl"
          source={user?.avatarUrl || null}
          name={`${user?.firstName || ""} ${user?.lastName || ""}`}
          showBorder
        />
        {isEditing && (
          <TouchableOpacity
            style={[
              styles.changePhotoButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[200],
              },
            ]}
          >
            <Text
              style={[
                styles.changePhotoText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {t("profile.changePhoto")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Form */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700],
              },
            ]}
          >
            {t("profile.basicInfo")}
          </Text>

          {renderField(t("auth.firstName"), firstName, setFirstName)}
          {renderField(t("auth.lastName"), lastName, setLastName)}
          {renderField(t("auth.email"), email, undefined, false)}

          <View style={styles.verificationContainer}>
            <Ionicons
              name={isVerified ? "checkmark-circle" : "alert-circle-outline"}
              size={20}
              color={
                isVerified
                  ? theme.colors.success[500]
                  : theme.colors.warning[500]
              }
              style={styles.verificationIcon}
            />
            <Text
              style={[
                styles.verificationText,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {isVerified
                ? t("profile.emailVerified")
                : t("profile.emailNotVerified")}
            </Text>
            {!isVerified && (
              <TouchableOpacity>
                <Text
                  style={[
                    styles.verifyLink,
                    { color: theme.colors.primary },
                  ]}
                >
                  {t("profile.verifyNow")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {renderField(t("profile.phoneNumber"), phoneNumber, setPhoneNumber)}
        </View>

        {/* Cancel button (only shown when editing) */}
        {isEditing && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={handleCancel}
          >
            <Text
              style={[
                styles.cancelButtonText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  editButton: {
    padding: spacing.xs,
  },
  editButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  changePhotoButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  changePhotoText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  verificationIcon: {
    marginRight: spacing.xs,
  },
  verificationText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  verifyLink: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  cancelButton: {
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  spacer: {
    height: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
});

