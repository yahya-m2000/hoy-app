import type { ICancellationPolicy } from "@shared/types";

export const getCancellationTypeTitle = (
  policyType: ICancellationPolicy["policyType"]
) => {
  switch (policyType) {
    case "flexible":
      return "Flexible";
    case "moderate":
      return "Moderate";
    case "strict":
      return "Strict";
    case "custom":
      return "Custom";
    default:
      return "Moderate";
  }
};

export const getCancellationTypeDescription = (
  policyType: ICancellationPolicy["policyType"]
) => {
  switch (policyType) {
    case "flexible":
      return "Full refund 1 day prior to arrival";
    case "moderate":
      return "Full refund 5 days prior to arrival";
    case "strict":
      return "Full refund 14 days prior to arrival";
    case "custom":
      return "Custom cancellation terms apply";
    default:
      return "Full refund 5 days prior to arrival";
  }
};
