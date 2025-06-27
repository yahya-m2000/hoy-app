import { useQuery } from "@tanstack/react-query";
import { fetchPropertyPolicies } from "@shared/services/api/properties";

export const usePropertyPolicies = (propertyId: string) => {
  return useQuery({
    queryKey: ["property-policies", propertyId],
    queryFn: () => fetchPropertyPolicies(propertyId),
    enabled: !!propertyId,
  });
};
