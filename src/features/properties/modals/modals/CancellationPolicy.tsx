import React from "react";
import { useTheme } from "src/core/hooks/useTheme";
// import {
//   OverlayScreen,
//   PolicySection,
//   RefundSchedule,
//     BulletList,
//   } from "@shared/components/common";

import { usePropertyPolicies } from "../../hooks/usePropertyPolicies";
import {
  getCancellationTypeTitle,
  getCancellationTypeDescription,
} from "src/core/utils";
import { Container, OverlayScreen } from "src/shared";
import { BulletList, PolicySection, RefundSchedule } from "src/features/host";

interface CancellationPolicyScreenProps {
  propertyId?: string;
  onClose?: () => void;
}

const CancellationPolicyScreen: React.FC<CancellationPolicyScreenProps> = ({
  propertyId,
  onClose,
}) => {
  const { theme } = useTheme();
  const { data: policies, isLoading } = usePropertyPolicies(propertyId || "");
  const cancellationPolicy = policies?.cancellationPolicy;
  return (
    <OverlayScreen
      headerIcon="close-circle-outline"
      headerTitle={`${getCancellationTypeTitle(
        cancellationPolicy?.policyType || "moderate"
      )} cancellation`}
      headerSubtitle={getCancellationTypeDescription(
        cancellationPolicy?.policyType || "moderate"
      )}
      isLoading={isLoading}
      loadingText="Loading..."
      errorText={
        !cancellationPolicy ? "Cancellation policy not available" : undefined
      }
      onClose={onClose}
      infoBoxIcon="bulb-outline"
      infoBoxText="Review the complete terms and conditions before booking. Cancellation policies help hosts plan for their property availability."
    >
      {cancellationPolicy && (
        <Container>
          {/* Refund Schedule */}
          <PolicySection title="Refund schedule">
            <RefundSchedule refunds={cancellationPolicy.refundPercentages} />
          </PolicySection>

          {/* Non-refundable fees */}
          {cancellationPolicy.nonRefundableFees.length > 0 && (
            <PolicySection title="Non-refundable fees">
              <BulletList
                items={cancellationPolicy.nonRefundableFees}
                icon="information-circle-outline"
                iconColor={theme.colors.warning}
              />
            </PolicySection>
          )}
        </Container>
      )}
    </OverlayScreen>
  );
};

export default CancellationPolicyScreen;
