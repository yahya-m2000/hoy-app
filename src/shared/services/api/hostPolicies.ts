import api from "../core/client";
import {
  HostPolicies,
  HostPoliciesSetupRequest,
  HostPoliciesUpdateRequest,
  RefundCalculationRequest,
  RefundCalculationResponse,
  ApiResponse,
} from "../../../modules/host/types/hostPolicies";

/**
 * Host Policies API Service
 * Handles all API operations related to host policies management
 */
export class HostPoliciesService {
  /**
   * Get current user's host policies
   */
  static async getHostPolicies(): Promise<ApiResponse<HostPolicies>> {
    const response = await api.get<ApiResponse<HostPolicies>>("/host/policies");
    return response.data;
  }

  /**
   * Setup initial host policies (for new hosts)
   */
  static async setupHostPolicies(
    data: HostPoliciesSetupRequest
  ): Promise<ApiResponse<HostPolicies>> {
    const response = await api.post<ApiResponse<HostPolicies>>(
      "/host/policies/setup",
      data
    );
    return response.data;
  }

  /**
   * Update existing host policies
   */
  static async updateHostPolicies(
    data: HostPoliciesUpdateRequest
  ): Promise<ApiResponse<HostPolicies>> {
    const response = await api.put<ApiResponse<HostPolicies>>(
      "/host/policies",
      data
    );
    return response.data;
  }
  /**
   * Calculate refund amount for a potential cancellation
   */
  static async calculateRefund(
    data: RefundCalculationRequest
  ): Promise<ApiResponse<RefundCalculationResponse>> {
    const response = await api.get<ApiResponse<RefundCalculationResponse>>(
      "/host/policies/cancellation-calculation",
      { params: data }
    );
    return response.data;
  }

  /**
   * Get default host policies template
   */
  static async getDefaultPolicies(): Promise<ApiResponse<HostPolicies>> {
    const response = await api.get<ApiResponse<HostPolicies>>(
      "/host/policies/defaults"
    );
    return response.data;
  }

  /**
   * Check if user has completed host setup
   */
  static async checkHostSetupStatus(): Promise<
    ApiResponse<{ isSetupComplete: boolean; completedSteps: string[] }>
  > {
    const response = await api.get<
      ApiResponse<{ isSetupComplete: boolean; completedSteps: string[] }>
    >("/host/policies/status");
    return response.data;
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
