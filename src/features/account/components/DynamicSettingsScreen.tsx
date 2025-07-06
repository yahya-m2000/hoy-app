/**
 * Dynamic Settings Screen Component
 * Handles different types of settings screens dynamically based on the setting type
 */

import React, { useState, useEffect } from "react";
import { ScrollView, Alert, Linking, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Components
import {
  Screen,
  Container,
  Header,
  Text,
  Button,
  Input,
  LoadingSkeleton,
  Icon,
} from "@shared/components";
import {
  CurrencyModal,
  LanguageModal,
} from "@shared/components/overlay/SettingsModals";
import InfoBox from "src/features/host/components/listings/add-property/InfoBox";
import AvatarPicker from "@shared/components/form/AvatarPicker";

// Hooks
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useCurrentUser, useUpdateProfile } from "@features/user/hooks";
import { useToast, useAuth } from "@core/context";

// Constants
import { iconSize, spacing } from "@core/design";

interface DynamicSettingsScreenProps {
  settingType: string;
}

// Setting configurations
interface SettingConfig {
  title: string;
  description: string;
  infoTitle: string;
  infoDescription: string;
  type: "modal" | "form" | "info" | "theme";
  modalType?: "currency" | "language";
}

const settingConfigs: Record<string, SettingConfig> = {
  currency: {
    title: "profile.currency",
    description: "profile.currencyDesc",
    infoTitle: "profile.currencyInfo.title",
    infoDescription: "profile.currencyInfo.description",
    type: "modal",
    modalType: "currency",
  },
  language: {
    title: "profile.language",
    description: "profile.languageDesc",
    infoTitle: "profile.languageInfo.title",
    infoDescription: "profile.languageInfo.description",
    type: "modal",
    modalType: "language",
  },
  "personal-info": {
    title: "profile.personalInfo",
    description: "profile.personalInfoDesc",
    infoTitle: "profile.personalInfoForm.title",
    infoDescription: "profile.personalInfoForm.description",
    type: "form",
  },
  "help-center": {
    title: "profile.helpCenter",
    description: "profile.helpCenterDesc",
    infoTitle: "profile.helpCenterInfo.title",
    infoDescription: "profile.helpCenterInfo.description",
    type: "info",
  },
  feedback: {
    title: "profile.giveFeedback",
    description: "profile.giveFeedbackDesc",
    infoTitle: "profile.feedbackInfo.title",
    infoDescription: "profile.feedbackInfo.description",
    type: "info",
  },
  "terms-of-service": {
    title: "profile.termsOfService",
    description: "profile.termsOfServiceDesc",
    infoTitle: "profile.termsInfo.title",
    infoDescription: "profile.termsInfo.description",
    type: "info",
  },
  theme: {
    title: "profile.theme",
    description: "profile.themeDesc",
    infoTitle: "profile.themeInfo.title",
    infoDescription: "profile.themeInfo.description",
    type: "theme",
  },
};

// Modular Components

interface ThemeOptionProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  title,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <Container
        padding="xs"
        backgroundColor={isSelected ? "primary" : "background"}
        borderRadius="lg"
        borderWidth={isSelected ? 2 : 0}
        borderColor={isSelected ? theme.colors.primary : "transparent"}
        marginBottom="md"
      >
        <Text
          variant="h6"
          color={isSelected ? "inverse" : "primary"}
          marginLeft="sm"
        >
          {title}
        </Text>
      </Container>
    </TouchableOpacity>
  );
};

interface CurrencyDisplayProps {
  currencyInfo: {
    symbol: string;
    name: string;
    code: string;
  };
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ currencyInfo }) => {
  const { t } = useTranslation();

  return (
    <Container marginBottom="lg">
      <Text variant="h6" marginBottom="sm">
        {t("profile.currentCurrency")}
      </Text>
      <Container
        flexDirection="row"
        alignItems="center"
        padding="md"
        backgroundColor="surface"
        borderRadius="md"
        marginBottom="md"
      >
        <Text variant="h5" marginRight="md">
          {currencyInfo.symbol}
        </Text>
        <Container>
          <Text variant="h6" marginBottom="sm">
            {currencyInfo.name}
          </Text>
          <Text variant="body2" color="secondary">
            {currencyInfo.code}
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

interface LanguageDisplayProps {
  languageName: string;
  languageCode: string;
}

const LanguageDisplay: React.FC<LanguageDisplayProps> = ({
  languageName,
  languageCode,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Container marginBottom="lg">
      <Text variant="h6" marginBottom="sm">
        {t("profile.currentLanguage")}
      </Text>
      <Container
        flexDirection="row"
        alignItems="center"
        padding="md"
        borderRadius="md"
        marginBottom="md"
      >
        <Icon name="language-outline" size={iconSize.sm} />
        <Container marginLeft="md">
          <Text variant="h6">{languageName}</Text>
          <Text variant="body2" color="secondary">
            {languageCode.toUpperCase()}
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) => {
  return (
    <Container marginBottom="md">
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </Container>
  );
};

interface InfoSectionProps {
  title: string;
  description: string;
  buttonTitle: string;
  onButtonPress: () => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  description,
  buttonTitle,
  onButtonPress,
}) => {
  return (
    <Container>
      <Container marginBottom="xl">
        <Text variant="h6" marginBottom="sm">
          {title}
        </Text>
        <Text variant="body2" color="secondary">
          {description}
        </Text>
      </Container>

      <Button title={buttonTitle} onPress={onButtonPress} variant="outline" />
    </Container>
  );
};

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showInfoBox?: boolean;
  infoContent?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  showInfoBox = false,
  infoContent,
}) => {
  const { t } = useTranslation();

  return (
    <Container marginBottom="xl">
      <Container marginBottom="lg">
        <Text variant="h6" marginBottom="sm">
          {title}
        </Text>
        <Text variant="body2" color="secondary" marginBottom="lg">
          {description}
        </Text>
      </Container>

      {children}

      {showInfoBox && infoContent && (
        <Container marginTop="xl">
          <InfoBox content={infoContent} />
        </Container>
      )}
    </Container>
  );
};

export function DynamicSettingsScreen({
  settingType,
}: DynamicSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { theme, isDark, mode, toggleTheme } = useTheme();
  const { currency, supportedCurrencies } = useCurrency();
  const { showToast } = useToast();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  // Modal states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Form states for personal info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const config = settingConfigs[settingType as keyof typeof settingConfigs];

  // Initialize form data for personal info
  useEffect(() => {
    if (currentUser && settingType === "personal-info") {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhoneNumber(currentUser.phoneNumber || "");
      setAvatar(currentUser.profilePicture || currentUser.avatarUrl || null);
      const addr = (currentUser as any).address || {};
      setCity(addr.city || "");
      setCountry(addr.country || "");
    }
  }, [currentUser, settingType]);

  // Reset modal states when setting type changes
  useEffect(() => {
    setShowCurrencyModal(false);
    setShowLanguageModal(false);
  }, [settingType]);

  if (!config) {
    return (
      <Screen>
        <Container flex={1} justifyContent="center" alignItems="center">
          <Text variant="h6">Setting not found</Text>
        </Container>
      </Screen>
    );
  }

  // Get current language display name
  const getLanguageDisplayName = () => {
    switch (i18n.language) {
      case "en":
        return "English";
      case "fr":
        return "Français";
      case "ar":
        return "العربية";
      case "so":
        return "Soomaali";
      default:
        return "English";
    }
  };

  // Get current currency info
  const getCurrentCurrencyInfo = () => {
    return (
      supportedCurrencies.find((curr) => curr.code === currency) || {
        code: currency,
        name: currency,
        symbol: currency,
      }
    );
  };

  // Handle currency selection
  const handleCurrencySelected = (selectedCurrency: string) => {
    console.log("Currency selected:", selectedCurrency);
  };

  // Handle language selection
  const handleLanguageSelected = (selectedLanguage: string) => {
    console.log("Language selected:", selectedLanguage);
    // Force a re-render to update the UI with new language
    // The i18n change should trigger this automatically, but we can force it
    setTimeout(() => {
      // This will trigger a re-render
    }, 100);
  };

  // Handle personal info save
  const handlePersonalInfoSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
        phoneNumber,
        profilePicture: avatar || undefined,
        address: { city, country },
      } as any);
      showToast({ type: "success", message: t("common.success") });
      router.back();
    } catch (error: any) {
      console.error("Update profile error", error);
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : t("common.error"),
      });
    }
  };

  // Handle info-only actions
  const handleInfoAction = () => {
    switch (settingType) {
      case "help-center":
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", { feature: t("profile.helpCenter") }),
          [{ text: t("common.ok") }]
        );
        break;
      case "feedback":
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", {
            feature: t("profile.giveFeedback"),
          }),
          [{ text: t("common.ok") }]
        );
        break;
      case "terms-of-service":
        Alert.alert(
          t("common.comingSoon"),
          t("common.featureNotAvailable", {
            feature: t("profile.termsOfService"),
          }),
          [{ text: t("common.ok") }]
        );
        break;
    }
  };

  // Show loading for personal info
  if (userLoading && settingType === "personal-info") {
    return (
      <Screen
        header={{
          title: t(config.title),
          left: { icon: "arrow-back", onPress: () => router.back() },
        }}
      >
        <Container flex={1} padding="lg">
          <LoadingSkeleton />
        </Container>
      </Screen>
    );
  }

  return (
    <>
      <Screen
        header={{
          title: t(config.title),
          left: { icon: "arrow-back", onPress: () => router.back() },
          showDivider: false,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Currency Setting */}
          {config.type === "modal" && config.modalType === "currency" && (
            <Container marginBottom="xl">
              <CurrencyDisplay currencyInfo={getCurrentCurrencyInfo()} />

              <Button
                title={t("profile.changeCurrency")}
                onPress={() => setShowCurrencyModal(true)}
                variant="primary"
              />

              <Container marginTop="xl">
                <InfoBox content={t(config.infoDescription)} />
              </Container>
            </Container>
          )}

          {/* Language Setting */}
          {config.type === "modal" && config.modalType === "language" && (
            <Container marginBottom="xl">
              <LanguageDisplay
                languageName={getLanguageDisplayName()}
                languageCode={i18n.language}
              />

              <Button
                title={t("profile.selectLanguage")}
                onPress={() => setShowLanguageModal(true)}
                variant="primary"
              />

              <Container marginTop="xl">
                <InfoBox content={t(config.infoDescription)} />
              </Container>
            </Container>
          )}

          {/* Personal Info Form */}
          {config.type === "form" && (
            <Container>
              <Container marginBottom="lg">
                <Text variant="body2" color="secondary" marginBottom="lg">
                  {t(config.description)}
                </Text>
              </Container>

              {/* Avatar Picker */}
              <Container alignItems="center" marginBottom="lg">
                <AvatarPicker value={avatar} onChange={setAvatar} size={100} />
              </Container>

              {/* Form Fields */}
              <FormField
                label={t("profile.personalInfoForm.firstName")}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t("profile.personalInfoForm.firstName")}
              />

              <FormField
                label={t("profile.personalInfoForm.lastName")}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t("profile.personalInfoForm.lastName")}
              />

              <FormField
                label={t("profile.personalInfoForm.phone")}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={t("profile.personalInfoForm.phone")}
                keyboardType="phone-pad"
              />

              <FormField
                label={t("profile.personalInfoForm.city")}
                value={city}
                onChangeText={setCity}
                placeholder={t("profile.personalInfoForm.city")}
              />

              <FormField
                label={t("profile.personalInfoForm.country")}
                value={country}
                onChangeText={setCountry}
                placeholder={t("profile.personalInfoForm.country")}
              />

              {/* Save Button */}
              <Container marginTop="md">
                <Button
                  title={t("common.save")}
                  onPress={handlePersonalInfoSave}
                  variant="primary"
                  loading={updateProfileMutation.isPending}
                />
              </Container>
            </Container>
          )}

          {/* Theme Setting */}
          {config.type === "theme" && (
            <SettingsSection
              title={t(config.infoTitle)}
              description={t(config.infoDescription)}
              showInfoBox={true}
              infoContent={t(config.infoDescription)}
            >
              <Container marginBottom="xl">
                <ThemeOption
                  title={t("profile.themeSystem")}
                  isSelected={mode === "system"}
                  onPress={() => toggleTheme()}
                />

                <ThemeOption
                  title={t("profile.themeLight")}
                  isSelected={mode === "light"}
                  onPress={() => toggleTheme()}
                />

                <ThemeOption
                  title={t("profile.themeDark")}
                  isSelected={mode === "dark"}
                  onPress={() => toggleTheme()}
                />
              </Container>
            </SettingsSection>
          )}

          {/* Info-only settings */}
          {config.type === "info" && (
            <InfoSection
              title={t(config.infoTitle)}
              description={t(config.infoDescription)}
              buttonTitle={t("common.comingSoon")}
              onButtonPress={handleInfoAction}
            />
          )}
        </ScrollView>
      </Screen>

      {/* Currency Modal - Only show for currency settings */}
      {config.type === "modal" && config.modalType === "currency" && (
        <CurrencyModal
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          onCurrencySelected={handleCurrencySelected}
        />
      )}

      {/* Language Modal - Only show for language settings */}
      {config.type === "modal" && config.modalType === "language" && (
        <LanguageModal
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          onLanguageSelected={handleLanguageSelected}
        />
      )}
    </>
  );
}
