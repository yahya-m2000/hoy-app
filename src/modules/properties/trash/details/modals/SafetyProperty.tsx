import React from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { Container, Text } from "@shared/components/base";
import {
  OverlayScreen,
  SafetyItem,
  PolicySection,
  InfoBox,
  BulletList,
} from "@shared/components/common";
import { usePropertyPolicies } from "@shared/hooks";

interface SafetyPropertyModalProps {
  propertyId?: string;
  onClose?: () => void;
}

const SafetyPropertyModal: React.FC<SafetyPropertyModalProps> = ({
  propertyId,
  onClose,
}) => {
  const { theme } = useTheme();

  const { data: policies, isLoading } = usePropertyPolicies(propertyId || "");
  const safetyFeatures = policies?.safetyFeatures;
  return (
    <OverlayScreen
      headerIcon="shield-checkmark-outline"
      headerTitle="Safety & Property"
      headerSubtitle="Safety features and property information"
      isLoading={isLoading}
      loadingText="Loading..."
      errorText={
        !safetyFeatures ? "Safety information not available" : undefined
      }
      infoBoxIcon="warning-outline"
      infoBoxColor="rgba(245, 158, 11, 0.1)"
      infoBoxText="Please review all safety information carefully. Report any safety concerns to your host immediately. In case of emergency, contact local emergency services."
      onClose={onClose}
    >
      {safetyFeatures && (
        <Container>
          {/* Safety Equipment */}
          <PolicySection title="Safety equipment">
            <SafetyItem
              available={safetyFeatures.smokeDetector}
              title="Smoke detector"
              description="Helps detect smoke and fire hazards"
            />
            <SafetyItem
              available={safetyFeatures.carbonMonoxideDetector}
              title="Carbon monoxide detector"
              description="Detects dangerous CO gas levels"
            />
            <SafetyItem
              available={safetyFeatures.fireExtinguisher}
              title="Fire extinguisher"
              description="Available for emergency fire suppression"
            />
            <SafetyItem
              available={safetyFeatures.firstAidKit}
              title="First aid kit"
              description="Basic medical supplies available"
            />
          </PolicySection>

          {/* Security */}
          <PolicySection title="Security">
            <SafetyItem
              available={safetyFeatures.securityCameras.exterior}
              title="Exterior security cameras"
              description={
                safetyFeatures.securityCameras.description ||
                "External monitoring for security"
              }
            />
            <SafetyItem
              available={safetyFeatures.securityCameras.interior}
              title="Interior security cameras"
              description="Internal monitoring - privacy concerns may apply"
            />
            {safetyFeatures.securityCameras.description && (
              <InfoBox>
                <Text
                  variant="caption"
                  color={theme.text.secondary}
                  style={{ lineHeight: 18 }}
                >
                  {safetyFeatures.securityCameras.description}
                </Text>
              </InfoBox>
            )}
          </PolicySection>

          {/* Property Hazards */}
          <PolicySection title="Property considerations">
            <SafetyItem
              available={!safetyFeatures.weaponsOnProperty}
              title="No weapons on property"
              description={
                safetyFeatures.weaponsOnProperty
                  ? "Weapons present on property"
                  : "Property is weapon-free"
              }
            />
            <SafetyItem
              available={!safetyFeatures.dangerousAnimals}
              title="No dangerous animals"
              description={
                safetyFeatures.dangerousAnimals
                  ? "Potentially dangerous animals present"
                  : "No dangerous animals on property"
              }
            />
          </PolicySection>

          {/* Additional Safety Information */}
          {safetyFeatures.additionalSafetyInfo.length > 0 && (
            <PolicySection title="Additional safety information">
              <BulletList
                items={safetyFeatures.additionalSafetyInfo}
                icon="information-circle-outline"
                iconColor={theme.colors.primary}
              />
            </PolicySection>
          )}
        </Container>
      )}
    </OverlayScreen>
  );
};

export default SafetyPropertyModal;
