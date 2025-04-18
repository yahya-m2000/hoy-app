/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import spacing from "../../../src/constants/spacing";
import PropertyCard from "../../../src/components/PropertyCard";
import SearchBar from "../../../src/components/SearchBar";
import { mockProperties } from "../../../src/utils/mockData";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const renderCategory = ({ item }: { item: string }) => (
    <View
      style={[
        styles.categoryItem,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
    >
      <Text
        style={[
          styles.categoryText,
          { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
        ]}
      >
        {item}
      </Text>
    </View>
  );

  const categories = [
    t("categories.trending"),
    t("categories.beachfront"),
    t("categories.cabins"),
    t("categories.design"),
    t("categories.countryside"),
    t("categories.mansions"),
  ];

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
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
          ]}
        >
          {t("home.title")}
        </Text>
        <SearchBar
          placeholder={t("home.searchPlaceholder")}
          onPress={() => {
            // Navigate to search screen
            console.log("Navigate to search screen");
          }}
          editable={false}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Featured Properties */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {t("home.featuredProperties")}
          </Text>
          <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>
            {t("common.seeAll")}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton height={220} width="100%" borderRadius={8} />
            <View style={styles.skeletonDetails}>
              <LoadingSkeleton height={20} width="70%" borderRadius={4} />
              <LoadingSkeleton
                height={16}
                width="50%"
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
              <LoadingSkeleton
                height={16}
                width="40%"
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        ) : (
          mockProperties.slice(0, 3).map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              style={styles.propertyCard}
              onPress={() => {
                console.log(`Navigate to property ${property.id}`);
              }}
            />
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {t("home.topRated")}
          </Text>
          <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>
            {t("common.seeAll")}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton height={220} width="100%" borderRadius={8} />
            <View style={styles.skeletonDetails}>
              <LoadingSkeleton height={20} width="70%" borderRadius={4} />
              <LoadingSkeleton
                height={16}
                width="50%"
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
              <LoadingSkeleton
                height={16}
                width="40%"
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        ) : (
          mockProperties.slice(3, 6).map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              style={styles.propertyCard}
              onPress={() => {
                console.log(`Navigate to property ${property.id}`);
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  categoriesContainer: {
    marginVertical: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.semibold) as any,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: String(fontWeight.semibold) as any,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.medium) as any,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  skeletonContainer: {
    marginBottom: spacing.md,
  },
  skeletonDetails: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});
