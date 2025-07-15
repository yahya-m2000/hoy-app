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
  debug: {
    title: "Debug",
    description: "Debug settings and font testing",
    infoTitle: "Debug Info",
    infoDescription: "Debug information and font testing",
    type: "debug",
  },
}; 