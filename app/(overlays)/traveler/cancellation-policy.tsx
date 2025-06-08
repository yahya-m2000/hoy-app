import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PolicyScreen, PolicySection, PolicyItem } from "@modules/properties";

const CancellationPolicyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get policy type from params or default to moderate
  const policyType =
    (params.type as "flexible" | "moderate" | "strict" | "super_strict") ||
    "moderate";

  const getPolicyDetails = () => {
    switch (policyType) {
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
            "Cancel between 1-5 days before check-in for a 50% refund",
            "Cancel within 24 hours of check-in for no refund",
            "Service fees are non-refundable",
          ],
        };
      case "strict":
        return {
          title: "Strict",
          description: "Full refund up to 14 days before check-in",
          details: [
            "Cancel up to 14 days before check-in for a full refund",
            "Cancel between 7-14 days before check-in for a 50% refund",
            "Cancel within 7 days of check-in for no refund",
            "Service fees are non-refundable",
          ],
        };
      case "super_strict":
        return {
          title: "Super Strict",
          description: "Full refund up to 60 days before check-in",
          details: [
            "Cancel up to 60 days before check-in for a full refund",
            "Cancel between 30-60 days before check-in for a 50% refund",
            "Cancel within 30 days of check-in for no refund",
            "Service fees are non-refundable",
          ],
        };
      default:
        return {
          title: "Moderate",
          description: "Full refund up to 5 days before check-in",
          details: [
            "Cancel up to 5 days before check-in for a full refund",
            "Cancel between 1-5 days before check-in for a 50% refund",
            "Cancel within 24 hours of check-in for no refund",
            "Service fees are non-refundable",
          ],
        };
    }
  };

  const policy = getPolicyDetails();

  return (
    <PolicyScreen
      title="Cancellation Policy"
      icon="cancel"
      onClose={() => router.back()}
    >
      {" "}
      <PolicySection title={policy.title}>
        <PolicyItem
          icon="info"
          title="Description"
          description={policy.description}
          highlight={true}
        />
      </PolicySection>
      <PolicySection title="Details">
        {policy.details.map((detail, index) => (
          <PolicyItem
            key={index}
            icon="check-circle"
            title={`Rule ${index + 1}`}
            description={detail}
          />
        ))}
      </PolicySection>
      <PolicySection title="Important Notes">
        <PolicyItem
          icon="payment"
          title="Service Fees"
          description="Service fees are non-refundable in all cases"
        />
        <PolicyItem
          icon="help"
          title="Extenuating Circumstances"
          description="Refunds may be provided for extenuating circumstances as determined by our support team"
        />
        <PolicyItem
          icon="schedule"
          title="Processing Time"
          description="Refunds typically process within 5-10 business days"
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export default CancellationPolicyScreen;
