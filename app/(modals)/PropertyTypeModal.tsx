/**
 * Property Type Modal Screen for detailed property search
 */

import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useLocalSearchParams, router } from "expo-router";

interface PropertyTypeOption {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export default function PropertyTypeModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const initialSelectedType =
    typeof params.type === "string" ? params.type : "";
  const [selectedType, setSelectedType] = useState(initialSelectedType);

  // Property type options
  const propertyTypes: PropertyTypeOption[] = [
    {
      id: "hotel",
      title: t("propertyTypes.hotel"),
      icon: "business",
      description: t("propertyTypes.hotelDesc"),
    },
    {
      id: "apartment",
      title: t("propertyTypes.apartment"),
      icon: "home",
      description: t("propertyTypes.apartmentDesc"),
    },
    {
      id: "villa",
      title: t("propertyTypes.villa"),
      icon: "home-outline",
      description: t("propertyTypes.villaDesc"),
    },
    {
      id: "cottage",
      title: t("propertyTypes.cottage"),
      icon: "bed-outline",
      description: t("propertyTypes.cottageDesc"),
    },
    {
      id: "cabin",
      title: t("propertyTypes.cabin"),
      icon: "trail-sign-outline",
      description: t("propertyTypes.cabinDesc"),
    },
    {
      id: "resort",
      title: t("propertyTypes.resort"),
      icon: "umbrella-outline",
      description: t("propertyTypes.resortDesc"),
    },
  ];

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleApply = () => {
    // Navigate back to the search page with the selected property type
    router.navigate({
      pathname: "/(tabs)/search",
      params: {
        type: selectedType,
      },
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
          ]}
        >
          {t("search.selectPropertyType")}
        </Text>
      </View>

      <View style={styles.content}>
        {propertyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeItem,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[50],
                borderColor:
                  selectedType === type.id
                    ? theme.colors.primary[500]
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                borderWidth: selectedType === type.id ? 2 : 1,
              },
            ]}
            onPress={() => handleSelect(type.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    selectedType === type.id
                      ? theme.colors.primary[100]
                      : isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[200],
                },
              ]}
            >
              <Ionicons
                name={type.icon as any}
                size={28}
                color={
                  selectedType === type.id
                    ? theme.colors.primary[500]
                    : isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600]
                }
              />
            </View>

            <View style={styles.typeInfo}>
              <Text
                style={[
                  styles.typeTitle,
                  {
                    color: isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {type.title}
              </Text>
              <Text
                style={[
                  styles.typeDescription,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
                numberOfLines={2}
              >
                {type.description}
              </Text>
            </View>

            {selectedType === type.id && (
              <View style={styles.checkContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderTopColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>{t("search.apply")}</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginLeft: spacing.md,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  typeItem: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  typeDescription: {
    fontSize: fontSize.sm,
  },
  checkContainer: {
    padding: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  applyButton: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
