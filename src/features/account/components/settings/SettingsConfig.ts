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
    title: "features.account.profile.currency",
    description: "features.account.profile.currencyDesc",
    infoTitle: "features.account.profile.currencyInfo.title",
    infoDescription: "features.account.profile.currencyInfo.description",
    type: "modal",
    modalType: "currency",
  },
  language: {
    title: "features.account.profile.language",
    description: "features.account.profile.languageDesc",
    infoTitle: "features.account.profile.languageInfo.title",
    infoDescription: "features.account.profile.languageInfo.description",
    type: "modal",
    modalType: "language",
  },
  "personal-info": {
    title: "features.account.profile.personalInfo",
    description: "features.account.profile.personalInfoDesc",
    infoTitle: "features.account.profile.personalInfoForm.title",
    infoDescription: "features.account.profile.personalInfoForm.description",
    type: "form",
  },
  "help-center": {
    title: "features.account.profile.helpCenter",
    description: "features.account.profile.helpCenterDesc",
    infoTitle: "features.account.profile.helpCenterInfo.title",
    infoDescription: "features.account.profile.helpCenterInfo.description",
    type: "info",
  },
  feedback: {
    title: "features.account.profile.giveFeedback",
    description: "features.account.profile.giveFeedbackDesc",
    infoTitle: "features.account.profile.feedbackInfo.title",
    infoDescription: "features.account.profile.feedbackInfo.description",
    type: "info",
  },
  "terms-of-service": {
    title: "features.account.profile.termsOfService",
    description: "features.account.profile.termsOfServiceDesc",
    infoTitle: "features.account.profile.termsInfo.title",
    infoDescription: "features.account.profile.termsInfo.description",
    type: "info",
  },
  theme: {
    title: "features.account.profile.theme",
    description: "features.account.profile.themeDesc",
    infoTitle: "features.account.profile.themeInfo.title",
    infoDescription: "features.account.profile.themeInfo.description",
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