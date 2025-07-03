import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "@core/api/services";

export const usePropertyPolicies = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-policies", propertyId],
    queryFn: async () => {
      // Get property data and extract policies
      const property = await getPropertyById(propertyId);
      return {
        cancellationPolicy: property.cancellationPolicy || null,
        houseRules: property.houseRules || null,
        safetyFeatures: property.safetyFeatures || null,
      };
    },
    enabled: !!propertyId,
  });
};
