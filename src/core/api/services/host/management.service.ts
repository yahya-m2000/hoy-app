/**
 * Host Management Service
 * 
 * Comprehensive service for host management operations including:
 * - Host policies setup and management
 * - Refund calculations and cancellation policies
 * - Host setup status verification
 * - Default policy templates
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import {
  HostPolicies,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  RefundCalculationRequest,
  RefundCalculationResponse,
} from "@core/types/host.types";

// Generic API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Host Policies API Service
 * Handles all API operations related to host policies management
 */

export class HostPoliciesService {
  /**
   * Get current user's host policies
   * 
   * @returns Promise<ApiResponse<HostPolicies>> - Host policies data
   * @throws Error if fetching policies fails
   */
  static async getHostPolicies(): Promise<ApiResponse<HostPolicies>> {
    try {
      const response = await api.get<ApiResponse<HostPolicies>>("/host/policies");
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.getHostPolicies", error);
      throw error;
    }
  }

  /**
   * Setup initial host policies (for new hosts)
   * 
   * @param data - Host policies setup data
   * @returns Promise<ApiResponse<HostPolicies>> - Created host policies
   * @throws Error if setup fails
   */
  static async setupHostPolicies(
    data: HostPoliciesSetupRequest
  ): Promise<ApiResponse<HostPolicies>> {
    try {
      const response = await api.post<ApiResponse<HostPolicies>>(
        "/host/policies/setup",
        data
      );
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.setupHostPolicies", error);
      throw error;
    }
  }

  /**
   * Update existing host policies
   * 
   * @param data - Host policies update data
   * @returns Promise<ApiResponse<HostPolicies>> - Updated host policies
   * @throws Error if update fails
   */
  static async updateHostPolicies(
    data: HostPoliciesUpdateRequest
  ): Promise<ApiResponse<HostPolicies>> {
    try {
      const response = await api.put<ApiResponse<HostPolicies>>(
        "/host/policies",
        data
      );
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.updateHostPolicies", error);
      throw error;
    }
  }

  /**
   * Calculate refund amount for a potential cancellation
   * 
   * @param data - Refund calculation parameters
   * @returns Promise<ApiResponse<RefundCalculationResponse>> - Refund calculation result
   * @throws Error if calculation fails
   */
  static async calculateRefund(
    data: RefundCalculationRequest
  ): Promise<ApiResponse<RefundCalculationResponse>> {
    try {
      const response = await api.get<ApiResponse<RefundCalculationResponse>>(
        "/host/policies/cancellation-calculation",
        { params: data }
      );
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.calculateRefund", error);
      throw error;
    }
  }

  /**
   * Get default host policies template
   * 
   * @returns Promise<ApiResponse<HostPolicies>> - Default policies template
   * @throws Error if fetching defaults fails
   */
  static async getDefaultPolicies(): Promise<ApiResponse<HostPolicies>> {
    try {
      const response = await api.get<ApiResponse<HostPolicies>>(
        "/host/policies/defaults"
      );
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.getDefaultPolicies", error);
      throw error;
    }
  }

  /**
   * Check if user has completed host setup
   * 
   * @returns Promise with setup status information
   * @throws Error if checking status fails
   */
  static async checkHostSetupStatus(): Promise<
    ApiResponse<{ isSetupComplete: boolean; completedSteps: string[] }>
  > {
    try {
      const response = await api.get<
        ApiResponse<{ isSetupComplete: boolean; completedSteps: string[] }>
      >("/host/policies/status");
      return response.data;
    } catch (error: any) {
      logErrorWithContext("HostPoliciesService.checkHostSetupStatus", error);
      throw error;
    }
  }
}

// Export individual functions for easier importing
export const {
  getHostPolicies,
  setupHostPolicies,
  updateHostPolicies,
  calculateRefund,
  getDefaultPolicies,
  checkHostSetupStatus,
} = HostPoliciesService;
