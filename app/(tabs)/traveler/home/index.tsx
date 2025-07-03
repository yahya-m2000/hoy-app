/**
 * Home screen for the Hoy application
 * Shows featured and recommended property listings with search functionality
 * Main landing page for travelers to discover accommodations
 */

// React Native core
import React from "react";
import { ScrollView, Image, TouchableOpacity } from "react-native";

// Expo and third-party libraries
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// App context and hooks
import { useTheme } from "src/core/hooks";
import { useAuth } from "src/core/context";
import { useCurrentUser } from "src/features/user/hooks";

// Base components
import { Container, Text, Button, AnimatedContainer } from "@shared/components";

// Module components
import { HorizontalListingsCarousel } from "@modules/properties";

// Utils
import { userUtils } from "@shared/utils";

// Constants
import { spacing, radius } from "@core/design";
import { Skeleton } from "@rneui/themed/dist";
import { t } from "i18next";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const router = useRouter();

  // Track status of each carousel
  const [carouselStatus, setCarouselStatus] = React.useState({
    ny: "loading",
    sav: "loading",
    bk: "loading",
  });
  const [retryKey, setRetryKey] = React.useState(0);

  const handleStatusChange = (
    key: "ny" | "sav" | "bk",
    status: "loading" | "success" | "error"
  ) => {
    setCarouselStatus((prev) => ({ ...prev, [key]: status }));
  };

  const allError =
    carouselStatus.ny === "error" &&
    carouselStatus.sav === "error" &&
    carouselStatus.bk === "error";

  // Helper: are all carousels loading?
  const allLoading =
    carouselStatus.ny === "loading" &&
    carouselStatus.sav === "loading" &&
    carouselStatus.bk === "loading";

  // Handle sign in button press
  const handleSignInPress = () => {
    router.push("/(auth)/sign-in");
  };

  if (allError) {
    return (
      <Container
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="xl"
        backgroundColor="#fff"
      >
        <Container marginBottom="md">
          <Text size="xl" weight="medium">
            {t("home.cannotConnect")}
          </Text>
        </Container>
        <Container marginBottom="lg">
          <Text size="md">{t("home.pleaseTryAgainLater")}</Text>
        </Container>
        <Button
          title="Retry"
          onPress={() => {
            setRetryKey((k) => k + 1);
            setCarouselStatus({ ny: "loading", sav: "loading", bk: "loading" });
          }}
        />
      </Container>
    );
  }

  return (
    <Container
      flex={1}
      backgroundColor={isDark ? theme.colors.gray[900] : theme.colors.gray[50]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Logo Section */}
        <Container alignItems="center" marginTop="md">
          <Image
            source={require("../../../../assets/image.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Container>

        {/* Header Section */}
        {allLoading || allError ? (
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="md"
            paddingVertical="md"
            marginBottom="lg"
          >
            <Skeleton
              height={28}
              width={120}
              style={{
                borderRadius: 8,
                backgroundColor: theme.colors.gray[100],
              }}
              skeletonStyle={{ backgroundColor: theme.skeleton }}
            />
            <Skeleton
              height={28}
              width={80}
              style={{
                borderRadius: 8,
                backgroundColor: theme.colors.gray[100],
              }}
              skeletonStyle={{ backgroundColor: theme.skeleton }}
            />
          </Container>
        ) : (
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="md"
            paddingVertical="md"
            marginBottom="lg"
          >
            <Container flexDirection="row" alignItems="center">
              <Text size="lg" weight="medium">
                {t("home.hello")},&nbsp;
                {userUtils.getGreeting(isAuthenticated, user)}
              </Text>
            </Container>

            {!isAuthenticated && (
              <TouchableOpacity onPress={handleSignInPress}>
                <Text size="lg" weight="medium">
                  {t("home.signIn")}
                </Text>
              </TouchableOpacity>
            )}
          </Container>
        )}

        {/* Content Section */}
        <Container>
          <HorizontalListingsCarousel
            key={`ny-${retryKey}`}
            city="New York"
            onStatusChange={(status) => handleStatusChange("ny", status)}
          />
          <HorizontalListingsCarousel
            key={`sav-${retryKey}`}
            city="Savannah"
            onStatusChange={(status) => handleStatusChange("sav", status)}
          />
          <HorizontalListingsCarousel
            key={`bk-${retryKey}`}
            city="Brooklyn"
            onStatusChange={(status) => handleStatusChange("bk", status)}
          />
        </Container>
      </ScrollView>
    </Container>
  );
}

const styles = {
  // Content
  content: {
    paddingBottom: spacing.xxl,
  },

  // Logo
  logo: {
    width: 120,
    height: 30,
  },
};
