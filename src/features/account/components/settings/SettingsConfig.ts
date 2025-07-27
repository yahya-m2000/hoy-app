/**
 * Settings Configuration
 * Centralized configuration for all dynamic settings screens
 */

export interface SettingConfig {
  title: string;
  description: string;
  infoTitle: string;
  infoDescription: string;
  type: "modal" | "form" | "info" | "theme" | "debug";
  modalType?: "currency" | "language";
}

export const settingConfigs: Record<string, SettingConfig> = {
  currency: {
    title: "features.profile.currency",
    description: "features.profile.currencyDesc",
    infoTitle: "features.profile.currencyInfo.title",
    infoDescription: "features.profile.currencyInfo.description",
    type: "modal",
    modalType: "currency",
  },
  language: {
    title: "features.profile.language",
    description: "features.profile.languageDesc",
    infoTitle: "features.profile.languageInfo.title",
    infoDescription: "features.profile.languageInfo.description",
    type: "modal",
    modalType: "language",
  },
  "personal-info": {
    title: "features.profile.personalInfo",
    description: "features.profile.personalInfoDesc",
    infoTitle: "features.profile.personalInfoForm.title",
    infoDescription: "features.profile.personalInfoForm.description",
    type: "form",
  },
  "help-center": {
    title: "features.profile.helpCenter",
    description: "features.profile.helpCenterDesc",
    infoTitle: "features.profile.helpCenterInfo.title",
    infoDescription: "features.profile.helpCenterInfo.description",
    type: "info",
  },
  feedback: {
    title: "features.profile.giveFeedback",
    description: "features.profile.giveFeedbackDesc",
    infoTitle: "features.profile.feedbackInfo.title",
    infoDescription: "features.profile.feedbackInfo.description",
    type: "info",
  },
  "terms-of-service": {
    title: "features.profile.termsOfService",
    description: "features.profile.termsOfServiceDesc",
    infoTitle: "features.profile.termsInfo.title",
    infoDescription: "features.profile.termsInfo.description",
    type: "info",
  },
  theme: {
    title: "features.profile.theme",
    description: "features.profile.themeDesc",
    infoTitle: "features.profile.themeInfo.title",
    infoDescription: "features.profile.themeInfo.description",
    type: "theme",
  },
  debug: {
    title: "Debug",
    description: "Debug settings and font testing",
    infoTitle: "Debug Info",
    infoDescription: "Debug information and font testing",
    type: "debug",
  },
}; 