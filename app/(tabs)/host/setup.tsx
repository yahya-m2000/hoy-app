// /**
//  * Host Setup Screen
//  * Complete host onboarding flow with verification, agreement, policies, preferences, and profile
//  */

// import React, { useState, useEffect } from "react";
// import { Modal, ScrollView, Alert } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useTranslation } from "react-i18next";
// import { useRouter } from "expo-router";

// // Core hooks and context
// import { useTheme } from "@core/hooks";
// import { useHostSetupNew } from "@features/host/hooks";
// import { BETA_CONFIG } from "@core/config/beta";

// // Shared components
// import {
//   Container,
//   Text,
//   Button,
//   Header,
//   LoadingSpinner,
// } from "@shared/components";

// // Host setup components
// import {
//   NewSetupProgress,
//   AccountVerificationStep,
//   HostAgreementStep,
//   DefaultPoliciesStep,
//   HostPreferencesStep,
//   HostProfileStep,
// } from "@features/host/components/setup";

// // Constants
// import { spacing } from "@core/design";
// import { SetupStepType } from "@core/types/host.types";

// interface SetupScreenProps {
//   visible: boolean;
//   onClose?: () => void;
//   onSetupComplete?: () => void;
// }

// export default function SetupScreen({
//   visible,
//   onClose,
//   onSetupComplete,
// }: SetupScreenProps) {
//   const { t } = useTranslation();
//   const { theme, isDark } = useTheme();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   const {
//     setupData,
//     currentStep,
//     stepStatus,
//     progress,
//     loading,
//     error,
//     goToStep,
//     nextStep,
//     previousStep,
//     canProceed,
//     canGoBack,
//     completeSetup,
//     updateVerificationData,
//     updateAgreementData,
//     updateDefaultPoliciesData,
//     updatePreferencesData,
//     updateProfileData,
//   } = useHostSetupNew();

//   const [isSaving, setIsSaving] = useState(false);

//   // Handle setup completion
//   const handleCompleteSetup = async () => {
//     setIsSaving(true);
//     try {
//       await completeSetup();

//       // Always show success and navigate, even if user was already a host
//       Alert.alert(
//         t("host.setup.setupComplete"),
//         t("host.setup.setupCompleteMessage"),
//         [
//           {
//             text: t("common.ok"),
//             onPress: () => {
//               if (onSetupComplete) {
//                 onSetupComplete();
//               } else {
//                 router.replace("/(tabs)/host/today");
//               }
//             },
//           },
//         ]
//       );
//     } catch (error: any) {
//       console.error("Setup completion failed:", error);

//       // If user is already a host, show success instead of error
//       if (error?.response?.data?.error?.includes("already a host")) {
//         Alert.alert(
//           t("host.setup.setupComplete"),
//           "You are already a host! Redirecting to dashboard...",
//           [
//             {
//               text: t("common.ok"),
//               onPress: () => {
//                 if (onSetupComplete) {
//                   onSetupComplete();
//                 } else {
//                   router.replace("/(tabs)/host/today");
//                 }
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert(t("common.error"), t("host.errors.setupFailed"), [
//           { text: t("common.ok") },
//         ]);
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleNext = async () => {
//     if (currentStep === SetupStepType.PROFILE) {
//       await handleCompleteSetup();
//     } else {
//       nextStep();
//     }
//   };

//   const handleCancel = () => {
//     Alert.alert(t("host.setup.cancelTitle"), t("host.setup.cancelMessage"), [
//       {
//         text: t("common.continue"),
//         style: "default",
//       },
//       {
//         text: t("host.setup.cancelConfirm"),
//         style: "destructive",
//         onPress: () => {
//           if (onClose) {
//             onClose();
//           }
//           router.replace("/(tabs)/host/today");
//         },
//       },
//     ]);
//   };

//   const getStepTitle = () => {
//     switch (currentStep) {
//       case SetupStepType.VERIFICATION:
//         return BETA_CONFIG.setup.includeVerification
//           ? t("host.setup.steps.verification.title")
//           : "";
//       case SetupStepType.AGREEMENT:
//         return BETA_CONFIG.setup.includeAgreement
//           ? t("host.setup.steps.agreement.title")
//           : "";
//       case SetupStepType.POLICIES:
//         return BETA_CONFIG.setup.includePolicies
//           ? t("host.setup.steps.policies.title")
//           : "";
//       case SetupStepType.PREFERENCES:
//         return BETA_CONFIG.setup.includePreferences
//           ? t("host.setup.steps.preferences.title")
//           : "";
//       case SetupStepType.PROFILE:
//         return BETA_CONFIG.setup.includeProfile
//           ? t("host.setup.steps.profile.title")
//           : "";
//       default:
//         return t("host.setup.title");
//     }
//   };

//   const getStepSubtitle = () => {
//     switch (currentStep) {
//       case SetupStepType.VERIFICATION:
//         return BETA_CONFIG.setup.includeVerification
//           ? t("host.setup.steps.verification.subtitle")
//           : "";
//       case SetupStepType.AGREEMENT:
//         return BETA_CONFIG.setup.includeAgreement
//           ? t("host.setup.steps.agreement.subtitle")
//           : "";
//       case SetupStepType.POLICIES:
//         return BETA_CONFIG.setup.includePolicies
//           ? t("host.setup.steps.policies.subtitle")
//           : "";
//       case SetupStepType.PREFERENCES:
//         return BETA_CONFIG.setup.includePreferences
//           ? t("host.setup.steps.preferences.subtitle")
//           : "";
//       case SetupStepType.PROFILE:
//         return BETA_CONFIG.setup.includeProfile
//           ? t("host.setup.steps.profile.subtitle")
//           : "";
//       default:
//         return t("host.setup.subtitle");
//     }
//   };

//   const renderCurrentStep = () => {
//     switch (currentStep) {
//       case SetupStepType.VERIFICATION:
//         return BETA_CONFIG.setup.includeVerification ? (
//           <AccountVerificationStep
//             data={setupData.verification}
//             onChange={updateVerificationData}
//             errors={{}}
//           />
//         ) : null;
//       case SetupStepType.AGREEMENT:
//         return BETA_CONFIG.setup.includeAgreement ? (
//           <HostAgreementStep
//             data={setupData.agreement}
//             onChange={updateAgreementData}
//             errors={{}}
//           />
//         ) : null;
//       case SetupStepType.POLICIES:
//         return BETA_CONFIG.setup.includePolicies ? (
//           <DefaultPoliciesStep
//             data={setupData.defaultPolicies}
//             onChange={updateDefaultPoliciesData}
//             errors={{}}
//           />
//         ) : null;
//       case SetupStepType.PREFERENCES:
//         return BETA_CONFIG.setup.includePreferences ? (
//           <HostPreferencesStep
//             data={setupData.preferences}
//             onChange={updatePreferencesData}
//             errors={{}}
//           />
//         ) : null;
//       case SetupStepType.PROFILE:
//         return BETA_CONFIG.setup.includeProfile ? (
//           <HostProfileStep
//             data={setupData.profile}
//             onChange={updateProfileData}
//             errors={{}}
//           />
//         ) : null;
//       default:
//         return null;
//     }
//   };

//   const getNextButtonTitle = () => {
//     if (currentStep === SetupStepType.PROFILE) {
//       return t("host.setup.finish");
//     }
//     return t("common.continue");
//   };

//   const getBackButtonTitle = () => {
//     if (
//       currentStep === SetupStepType.VERIFICATION &&
//       BETA_CONFIG.setup.includeVerification
//     ) {
//       return t("common.cancel");
//     }
//     return t("common.back");
//   };

//   const handleBackPress = () => {
//     if (
//       currentStep === SetupStepType.VERIFICATION &&
//       BETA_CONFIG.setup.includeVerification
//     ) {
//       handleCancel();
//     } else {
//       previousStep();
//     }
//   };

//   if (loading) {
//     return (
//       <Modal
//         visible={visible}
//         animationType="slide"
//         presentationStyle="fullScreen"
//         onRequestClose={() => onClose?.()}
//       >
//         <Container flex={1} backgroundColor="background">
//           <Header
//             title={t("host.setup.title")}
//             left={{
//               icon: "close",
//               onPress: () => onClose?.(),
//             }}
//           />
//           <Container flex={1} justifyContent="center" alignItems="center">
//             <LoadingSpinner size="large" />
//             <Container marginTop="md">
//               <Text
//                 variant="body"
//                 color="secondary"
//                 style={{ textAlign: "center" }}
//               >
//                 {t("host.common.loading")}
//               </Text>
//             </Container>
//           </Container>
//         </Container>
//       </Modal>
//     );
//   }

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="fullScreen"
//       onRequestClose={() => onClose?.()}
//     >
//       <Container flex={1} backgroundColor="background">
//         {/* Header */}
//         <Header
//           title={getStepTitle()}
//           left={{
//             icon: "close",
//             onPress: handleCancel,
//           }}
//         />

//         {/* Subtitle */}
//         <Container
//           paddingHorizontal="lg"
//           paddingVertical="sm"
//           backgroundColor="background"
//         >
//           <Text
//             variant="body"
//             color="secondary"
//             style={{ textAlign: "center" }}
//           >
//             {getStepSubtitle()}
//           </Text>
//         </Container>

//         {/* Content */}
//         <ScrollView
//           style={{ flex: 1 }}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             paddingHorizontal: spacing.lg,
//             paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxl),
//           }}
//         >
//           <Container paddingVertical="lg">{renderCurrentStep()}</Container>
//         </ScrollView>

//         {/* Footer with Navigation */}
//         <Container
//           paddingHorizontal="lg"
//           backgroundColor="background"
//           borderTopWidth={1}
//           borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
//           style={{
//             paddingBottom: Math.max(insets.bottom + spacing.md, spacing.lg),
//           }}
//         >
//           <NewSetupProgress
//             currentStep={currentStep}
//             stepStatus={stepStatus}
//             onStepPress={goToStep}
//           />

//           <Container
//             flexDirection="row"
//             justifyContent="space-between"
//             alignItems="center"
//           >
//             <Button
//               title={getBackButtonTitle()}
//               variant="outline"
//               onPress={handleBackPress}
//               style={{ flex: 1, marginRight: spacing.sm }}
//             />

//             <Button
//               title={getNextButtonTitle()}
//               variant="primary"
//               onPress={handleNext}
//               loading={isSaving}
//               disabled={!canProceed || isSaving}
//               style={{ flex: 1, marginLeft: spacing.sm }}
//             />
//           </Container>
//         </Container>
//       </Container>
//     </Modal>
//   );
// }
