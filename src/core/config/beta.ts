/**
 * Beta Configuration
 * Controls which features are enabled for beta testing
 */

export const BETA_CONFIG = {
  /**
   * Whether the app is in beta mode
   * Controls which setup steps and features are enabled
   */
  isBeta: true,

  /**
   * Setup steps configuration for beta mode
   */
  setup: {
    /**
     * Steps to include in beta setup flow
     * Set to false to skip verification for beta testing
     */
    includeVerification: false,
    includeAgreement: false,
    includePolicies: true,
    includePreferences: true,
    includeProfile: true,
  },

  /**
   * Feature flags for beta testing
   */
  features: {
    /**
     * Whether to show advanced verification options
     */
    advancedVerification: false,
    
    /**
     * Whether to require identity verification
     */
    requireIdentityVerification: false,
    
    /**
     * Whether to show detailed policy explanations
     */
    detailedPolicyExplanations: true,
    
    /**
     * Whether to enable auto-save functionality
     */
    autoSave: true,
  },

  /**
   * UI/UX settings for beta
   */
  ui: {
    /**
     * Whether to show progress indicators
     */
    showProgress: true,
    
    /**
     * Whether to show help text and tips
     */
    showHelpText: true,
    
    /**
     * Whether to show validation errors immediately
     */
    immediateValidation: true,
  }
};

/**
 * Helper function to get enabled setup steps
 */
export const getEnabledSetupSteps = () => {
  const { setup } = BETA_CONFIG;
  const steps = [];
  
  if (setup.includeVerification) steps.push('verification');
  if (setup.includeAgreement) steps.push('agreement');
  if (setup.includePolicies) steps.push('policies');
  if (setup.includePreferences) steps.push('preferences');
  if (setup.includeProfile) steps.push('profile');
  
  return steps;
};

/**
 * Helper function to check if a specific step is enabled
 */
export const isStepEnabled = (step: string) => {
  const enabledSteps = getEnabledSetupSteps();
  return enabledSteps.includes(step);
};

export default BETA_CONFIG; 