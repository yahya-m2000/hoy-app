/**
 * Hook for managing host properties
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { host } from "@core/api/services";
import type { PropertyFilters as HostPropertyFilters } from "@core/types/property.types";

export const useHostProperties = (filters?: HostPropertyFilters) => {
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<HostPropertyFilters>(
    filters || {}
  ); // Fetch properties query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["hostProperties", localFilters],
    queryFn: () => {
      console.log(
        "useHostProperties - calling fetchHostProperties with filters:",
        localFilters
      );
      // Convert PropertyFilters to HostPropertyFilters format
      const hostFilters = {
        ...localFilters,
        propertyType: Array.isArray(localFilters.propertyType) 
          ? localFilters.propertyType[0] 
          : localFilters.propertyType
      };
      return host.HostPropertyService.getProperties(hostFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      console.log(
        "useHostProperties - retry attempt:",
        failureCount,
        "error:",
        error
      );
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Log data and errors
  console.log(
    "useHostProperties - data:",
    data,
    "isLoading:",
    isLoading,
    "error:",
    error
  );

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: host.HostPropertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: host.HostPropertyService.updateProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: host.HostPropertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
    },
  });

  // Update property status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      propertyId,
      status,
    }: {
      propertyId: string;
      status: string;
    }) => host.HostPropertyService.updateStatus(propertyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
    },
  });

  const updateFilters = useCallback((newFilters: HostPropertyFilters) => {
    setLocalFilters((prev: HostPropertyFilters) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  return {
    // Data
    properties: data?.properties || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,

    // Loading states
    isLoading,
    isCreating: createPropertyMutation.isPending,
    isUpdating: updatePropertyMutation.isPending,
    isDeleting: deletePropertyMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Error states
    error,
    createError: createPropertyMutation.error,
    updateError: updatePropertyMutation.error,
    deleteError: deletePropertyMutation.error,
    statusError: updateStatusMutation.error,

    // Actions
    refetch,
    createProperty: createPropertyMutation.mutateAsync,
    updateProperty: updatePropertyMutation.mutateAsync,
    deleteProperty: deletePropertyMutation.mutateAsync,
    updatePropertyStatus: updateStatusMutation.mutateAsync,

    // Filters
    filters: localFilters,
    updateFilters,
    clearFilters,
  };
};

export const useHostProperty = (propertyId: string) => {
  const queryClient = useQueryClient();

  const {
    data: property,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hostProperty", propertyId],
    queryFn: () => host.HostPropertyService.getProperty(propertyId),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: host.HostPropertyService.updateProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperty", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
    },
  });

  return {
    property,
    isLoading,
    isUpdating: updatePropertyMutation.isPending,
    error,
    updateError: updatePropertyMutation.error,
    refetch,
    updateProperty: updatePropertyMutation.mutateAsync,
  };
};
