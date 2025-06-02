import React from "react";
import PolicyScreen, { PolicySection, PolicyItem } from "./PolicyScreen";

interface CancellationPolicyProps {
  onClose: () => void;
  cancellationPolicy?: {
    type: "flexible" | "moderate" | "strict" | "super_strict";
    description?: string;
    details?: string[];
  };
}

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
  onClose,
  cancellationPolicy = { type: "moderate" },
}) => {
  const getPolicyDetails = () => {
    switch (cancellationPolicy.type) {
      case "flexible":
        return {
          title: "Flexible",
          description: "Full refund up to 1 day before check-in",
          details: [
            "Cancel up to 24 hours before check-in for a full refund",
            "Cancel within 24 hours of check-in for a 50% refund",
            "After check-in, no refund",
            "Service fees are non-refundable",
          ],
        };
      case "moderate":
        return {
          title: "Moderate",
          description: "Full refund up to 5 days before check-in",
          details: [
            "Cancel up to 5 days before check-in for a full refund",
            "Cancel within 5 days of check-in for a 50% refund",
            "After check-in, no refund",
            "Service fees are non-refundable",
          ],
        };
      case "strict":
        return {
          title: "Strict",
          description: "Full refund up to 14 days before check-in",
          details: [
            "Cancel up to 14 days before check-in for a full refund",
            "Cancel within 14 days of check-in for a 50% refund",
            "After check-in, no refund",
            "Service fees are non-refundable",
          ],
        };
      case "super_strict":
        return {
          title: "Super Strict",
          description: "Full refund up to 30 days before check-in",
          details: [
            "Cancel up to 30 days before check-in for a full refund",
            "Cancel within 30 days of check-in for a 50% refund",
            "After check-in, no refund",
            "Service fees are non-refundable",
          ],
        };
      default:
        return {
          title: "Standard",
          description: "Moderate cancellation policy applies",
          details: ["Please contact host for specific cancellation terms"],
        };
    }
  };

  const policyDetails = getPolicyDetails();

  return (
    <PolicyScreen title="Cancellation Policy" icon="cancel" onClose={onClose}>
      <PolicySection title={policyDetails.title}>
        <PolicyItem
          icon="info"
          title="Policy Overview"
          description={policyDetails.description}
          highlight
        />
      </PolicySection>

      <PolicySection title="Cancellation Terms">
        {policyDetails.details.map((detail, index) => (
          <PolicyItem
            key={index}
            icon="check-circle"
            title={`Term ${index + 1}`}
            description={detail}
          />
        ))}
      </PolicySection>

      <PolicySection title="Important Information">
        <PolicyItem
          icon="warning"
          title="COVID-19 Policy"
          description="Special circumstances may apply. Please review our COVID-19 extenuating circumstances policy."
        />

        <PolicyItem
          icon="schedule"
          title="Time Zone"
          description="All cancellation deadlines are based on the property's local time zone."
        />

        <PolicyItem
          icon="payment"
          title="Refund Processing"
          description="Approved refunds will be processed within 5-10 business days to your original payment method."
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export { CancellationPolicy };
