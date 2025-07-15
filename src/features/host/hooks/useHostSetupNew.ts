/**
 * New Host Setup Hook
 * Comprehensive hook for managing the new multi-step host setup flow
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HostSetupService } from '@core/api/services/host/setup.service';
import { BETA_CONFIG, getEnabledSetupSteps, isStepEnabled } from '@core/config/beta';
import { useUserRole } from '@core/context';
import { 
  SetupStepType, 
  SetupStepStatus, 
  HostSetupData, 
  HostVerification, 
  HostAgreement, 
  HostDefaultPolicies, 
  HostPreferences, 
  HostProfile,
  HostSetupFormData
} from '@core/types/host.types';

export interface UseHostSetupNewReturn {
  // Data
  setupData: HostSetupFormData;
  currentStep: SetupStepType;
  stepStatus: Record<SetupStepType, SetupStepStatus>;
  progress: {
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  
  // State
  loading: boolean;
  error: string | null;
  autoSaving: boolean;
  lastSaved: Date | null;
  validationErrors: Record<string, string>;
  
  // Navigation
  goToStep: (step: SetupStepType) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;
  canGoBack: boolean;
  
  // Actions
  completeSetup: () => Promise<void>;
  
  // Data updates
  updateVerificationData: (data: Partial<HostVerification>) => void;
  updateAgreementData: (data: Partial<HostAgreement>) => void;
  updateDefaultPoliciesData: (data: Partial<HostDefaultPolicies>) => void;
  updatePreferencesData: (data: Partial<HostPreferences>) => void;
  updateProfileData: (data: Partial<HostProfile>) => void;
}

// Get enabled setup steps based on beta configuration
const getSetupSteps = () => {
  const steps: SetupStepType[] = [];
  
  if (BETA_CONFIG.setup.includeVerification) {
    steps.push(SetupStepType.VERIFICATION);
  }
  if (BETA_CONFIG.setup.includeAgreement) {
    steps.push(SetupStepType.AGREEMENT);
  }
  if (BETA_CONFIG.setup.includePolicies) {
    steps.push(SetupStepType.POLICIES);
  }
  if (BETA_CONFIG.setup.includePreferences) {
    steps.push(SetupStepType.PREFERENCES);
  }
  if (BETA_CONFIG.setup.includeProfile) {
    steps.push(SetupStepType.PROFILE);
  }
  
  return steps;
};

const SETUP_STEPS = getSetupSteps();

export const useHostSetupNew = (): UseHostSetupNewReturn => {
  const { t } = useTranslation();
  const { userRole } = useUserRole();
  
  // State
  const [setupData, setSetupData] = useState<HostSetupFormData>({
    verification: {
      isEmailVerified: false,
      isPhoneVerified: false,
      isIdentityVerified: false
    },
    agreement: {
      termsAccepted: false,
      privacyPolicyAccepted: false,
      hostGuaranteeAccepted: false
    },
    defaultPolicies: {
      cancellationPolicy: {
        type: 'flexible',
        refundPeriodDays: 30,
        fullRefundDays: 7,
        partialRefundDays: 1,
        noRefundDays: 0
      },
              houseRules: {
          checkInTime: '15:00',
          checkOutTime: '12:00',
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          additionalRules: []
        },
      checkInPreferences: {
        selfCheckIn: false,
        keyPickup: false,
        meetAndGreet: true
      }
    },
    preferences: {
      responseTime: 'within_24_hours',
      instantBooking: false,
      minimumNotice: 24,
      maxAdvanceBooking: 365,
      languages: ['en'],
      timezone: 'UTC',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: false,
        bookingRequests: true,
        messages: true,
        reviews: true,
        payments: true
      }
    },
    profile: {
      languages: ['en'],
      isSuperhost: false
    }
  });
  
  // Get initial step based on beta configuration
  const getInitialStep = () => {
    if (BETA_CONFIG.setup.includeVerification) {
      return SetupStepType.VERIFICATION;
    }
    if (BETA_CONFIG.setup.includeAgreement) {
      return SetupStepType.AGREEMENT;
    }
    if (BETA_CONFIG.setup.includePolicies) {
      return SetupStepType.POLICIES;
    }
    if (BETA_CONFIG.setup.includePreferences) {
      return SetupStepType.PREFERENCES;
    }
    if (BETA_CONFIG.setup.includeProfile) {
      return SetupStepType.PROFILE;
    }
    return SetupStepType.AGREEMENT; // fallback
  };

  const [currentStep, setCurrentStep] = useState<SetupStepType>(getInitialStep());
  
  // Initialize step status based on beta configuration
  const getInitialStepStatus = () => {
    const status: Record<SetupStepType, SetupStepStatus> = {
      [SetupStepType.VERIFICATION]: BETA_CONFIG.setup.includeVerification ? SetupStepStatus.IN_PROGRESS : SetupStepStatus.COMPLETED,
      [SetupStepType.AGREEMENT]: BETA_CONFIG.setup.includeAgreement ? SetupStepStatus.IN_PROGRESS : SetupStepStatus.COMPLETED,
      [SetupStepType.POLICIES]: BETA_CONFIG.setup.includePolicies ? SetupStepStatus.PENDING : SetupStepStatus.COMPLETED,
      [SetupStepType.PREFERENCES]: BETA_CONFIG.setup.includePreferences ? SetupStepStatus.PENDING : SetupStepStatus.COMPLETED,
      [SetupStepType.PROFILE]: BETA_CONFIG.setup.includeProfile ? SetupStepStatus.PENDING : SetupStepStatus.COMPLETED,
    };
    
    // Set the first enabled step to IN_PROGRESS
    const firstEnabledStep = SETUP_STEPS[0];
    if (firstEnabledStep) {
      status[firstEnabledStep] = SetupStepStatus.IN_PROGRESS;
    }
    
    return status;
  };
  
  const [stepStatus, setStepStatus] = useState<Record<SetupStepType, SetupStepStatus>>(getInitialStepStatus());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate progress
  const progress = {
    completedSteps: Object.values(stepStatus).filter(status => status === SetupStepStatus.COMPLETED).length,
    totalSteps: SETUP_STEPS.length,
    percentage: (Object.values(stepStatus).filter(status => status === SetupStepStatus.COMPLETED).length / SETUP_STEPS.length) * 100
  };
  
  // Validation functions (lenient in beta mode)
  const validateVerification = useCallback((data: Partial<HostVerification>): boolean => {
    if (BETA_CONFIG.isBeta) return true; // Skip verification in beta
    return !!(data.isEmailVerified && data.isPhoneVerified && data.isIdentityVerified);
  }, []);
  
  const validateAgreement = useCallback((data: Partial<HostAgreement>): boolean => {
    if (BETA_CONFIG.isBeta) return true; // Skip agreement in beta
    return !!(data.termsAccepted && data.privacyPolicyAccepted && data.hostGuaranteeAccepted);
  }, []);
  
  const validatePolicies = useCallback((data: Partial<HostDefaultPolicies>): boolean => {
    if (BETA_CONFIG.isBeta) return true; // Skip policies validation in beta
    return !!(data.cancellationPolicy?.type && data.houseRules?.checkInTime && data.houseRules?.checkOutTime);
  }, []);
  
  const validatePreferences = useCallback((data: Partial<HostPreferences>): boolean => {
    if (BETA_CONFIG.isBeta) return true; // Skip preferences validation in beta
    return !!(data.responseTime && data.languages && data.languages.length > 0);
  }, []);
  
  const validateProfile = useCallback((data: Partial<HostProfile>): boolean => {
    if (BETA_CONFIG.isBeta) return true; // Skip profile validation in beta
    return !!(data.bio && data.bio.length >= 50 && data.languages && data.languages.length > 0);
  }, []);
  
  // Check if current step is valid
  const isCurrentStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case SetupStepType.VERIFICATION:
        return BETA_CONFIG.setup.includeVerification ? validateVerification(setupData.verification) : true;
      case SetupStepType.AGREEMENT:
        return BETA_CONFIG.setup.includeAgreement ? validateAgreement(setupData.agreement) : true;
      case SetupStepType.POLICIES:
        return BETA_CONFIG.setup.includePolicies ? validatePolicies(setupData.defaultPolicies) : true;
      case SetupStepType.PREFERENCES:
        return BETA_CONFIG.setup.includePreferences ? validatePreferences(setupData.preferences) : true;
      case SetupStepType.PROFILE:
        return BETA_CONFIG.setup.includeProfile ? validateProfile(setupData.profile) : true;
      default:
        return false;
    }
  }, [currentStep, setupData, validateVerification, validateAgreement, validatePolicies, validatePreferences, validateProfile]);
  
  // Update step status based on validation
  const updateStepStatus = useCallback(() => {
    const newStatus = { ...stepStatus };
    
    // In beta mode, mark all steps as completed
    if (BETA_CONFIG.isBeta) {
      SETUP_STEPS.forEach(step => {
        newStatus[step] = SetupStepStatus.COMPLETED;
      });
    } else {
      SETUP_STEPS.forEach(step => {
        let isValid = false;
        
        switch (step) {
          case SetupStepType.VERIFICATION:
            isValid = BETA_CONFIG.setup.includeVerification ? validateVerification(setupData.verification) : true;
            break;
          case SetupStepType.AGREEMENT:
            isValid = BETA_CONFIG.setup.includeAgreement ? validateAgreement(setupData.agreement) : true;
            break;
          case SetupStepType.POLICIES:
            isValid = BETA_CONFIG.setup.includePolicies ? validatePolicies(setupData.defaultPolicies) : true;
            break;
          case SetupStepType.PREFERENCES:
            isValid = BETA_CONFIG.setup.includePreferences ? validatePreferences(setupData.preferences) : true;
            break;
          case SetupStepType.PROFILE:
            isValid = BETA_CONFIG.setup.includeProfile ? validateProfile(setupData.profile) : true;
            break;
        }
        
        if (isValid) {
          newStatus[step] = SetupStepStatus.COMPLETED;
        } else if (step === currentStep) {
          newStatus[step] = SetupStepStatus.IN_PROGRESS;
        } else {
          newStatus[step] = SetupStepStatus.PENDING;
        }
      });
    }
    
    setStepStatus(newStatus);
  }, [stepStatus, setupData, currentStep, validateVerification, validateAgreement, validatePolicies, validatePreferences, validateProfile]);
  
  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (autoSaving) return;
    
    // Check if user is in host role before auto-saving
    if (userRole !== "host") {
      console.log('Auto-save skipped: User not in host role');
      return;
    }
    
    setAutoSaving(true);
    try {
      // Save current step data
      switch (currentStep) {
        case SetupStepType.VERIFICATION:
          if (BETA_CONFIG.setup.includeVerification) {
            await HostSetupService.updateVerification({ verification: setupData.verification });
          }
          break;
        case SetupStepType.AGREEMENT:
          if (BETA_CONFIG.setup.includeAgreement) {
            await HostSetupService.updateAgreement({ agreement: setupData.agreement });
          }
          break;
        case SetupStepType.POLICIES:
          if (BETA_CONFIG.setup.includePolicies) {
            await HostSetupService.updateDefaultPolicies({ defaultPolicies: setupData.defaultPolicies });
          }
          break;
        case SetupStepType.PREFERENCES:
          if (BETA_CONFIG.setup.includePreferences) {
            await HostSetupService.updatePreferences({ preferences: setupData.preferences });
          }
          break;
        case SetupStepType.PROFILE:
          if (BETA_CONFIG.setup.includeProfile) {
            await HostSetupService.updateProfile({ profile: setupData.profile });
          }
          break;
      }
      
      setLastSaved(new Date());
      setError(null);
    } catch (err) {
      console.warn('Auto-save failed:', err);
      // Don't show error for auto-save failures to avoid disrupting user experience
    } finally {
      setAutoSaving(false);
    }
  }, [currentStep, setupData, autoSaving, userRole]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [autoSave]);

  // Update step status when data changes
  useEffect(() => {
    updateStepStatus();
  }, [setupData, currentStep]);

  // Schedule auto-save when data changes
  useEffect(() => {
    scheduleAutoSave();
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [setupData, scheduleAutoSave]);
  
  // Navigation
  const canProceed = isCurrentStepValid();
  const canGoBack = currentStep !== SetupStepType.VERIFICATION;
  
  const goToStep = useCallback((step: SetupStepType) => {
    setCurrentStep(step);
  }, []);
  
  const nextStep = useCallback(() => {
    const currentIndex = SETUP_STEPS.indexOf(currentStep);
    if (currentIndex < SETUP_STEPS.length - 1) {
      setCurrentStep(SETUP_STEPS[currentIndex + 1]);
    }
  }, [currentStep]);
  
  const previousStep = useCallback(() => {
    const currentIndex = SETUP_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(SETUP_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);
  
  // Data update functions
  const updateVerificationData = useCallback((data: Partial<HostVerification>) => {
    setSetupData(prev => ({
      ...prev,
      verification: { ...prev.verification, ...data }
    }));
  }, []);
  
  const updateAgreementData = useCallback((data: Partial<HostAgreement>) => {
    setSetupData(prev => ({
      ...prev,
      agreement: { ...prev.agreement, ...data }
    }));
  }, []);
  
  const updateDefaultPoliciesData = useCallback((data: Partial<HostDefaultPolicies>) => {
    setSetupData(prev => ({
      ...prev,
      defaultPolicies: { ...prev.defaultPolicies, ...data }
    }));
  }, []);
  
  const updatePreferencesData = useCallback((data: Partial<HostPreferences>) => {
    setSetupData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...data }
    }));
  }, []);
  
  const updateProfileData = useCallback((data: Partial<HostProfile>) => {
    setSetupData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...data }
    }));
  }, []);
  
  // Complete setup
  const completeSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In beta mode, skip validation and allow completion with minimal data
      if (BETA_CONFIG.isBeta) {
        console.log('Beta mode: Skipping validation for setup completion');
      } else {
        // Validate all steps (only in production)
        const allStepsValid = SETUP_STEPS.every(step => {
          switch (step) {
            case SetupStepType.VERIFICATION:
              return BETA_CONFIG.setup.includeVerification ? validateVerification(setupData.verification) : true;
            case SetupStepType.AGREEMENT:
              return BETA_CONFIG.setup.includeAgreement ? validateAgreement(setupData.agreement) : true;
            case SetupStepType.POLICIES:
              return BETA_CONFIG.setup.includePolicies ? validatePolicies(setupData.defaultPolicies) : true;
            case SetupStepType.PREFERENCES:
              return BETA_CONFIG.setup.includePreferences ? validatePreferences(setupData.preferences) : true;
            case SetupStepType.PROFILE:
              return BETA_CONFIG.setup.includeProfile ? validateProfile(setupData.profile) : true;
            default:
              return false;
          }
        });
        
        if (!allStepsValid) {
          throw new Error(t('host.errors.incompleteSetup'));
        }
      }
      
      // Complete setup via API
      try {
        const response = await HostSetupService.completeSetup({
          verification: setupData.verification as HostVerification,
          agreement: setupData.agreement as HostAgreement,
          defaultPolicies: setupData.defaultPolicies as HostDefaultPolicies,
          preferences: setupData.preferences as HostPreferences,
          profile: setupData.profile as HostProfile
        });
        
        if (!response.success) {
          throw new Error(response.message || t('host.errors.setupFailed'));
        }
      } catch (err: any) {
        // If user is already a host, that's fine - just log it
        if (err?.response?.data?.error?.includes('already a host')) {
          console.log('User is already a host - setup was already completed');
        } else {
          throw err; // Re-throw other errors
        }
      }
      
      // Mark all steps as completed
      const completedStatus = SETUP_STEPS.reduce((acc, step) => {
        acc[step] = SetupStepStatus.COMPLETED;
        return acc;
      }, {} as Record<SetupStepType, SetupStepStatus>);
      
      setStepStatus(completedStatus);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('host.errors.setupFailed');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setupData, t, validateVerification, validateAgreement, validatePolicies, validatePreferences, validateProfile]);
  
  return {
    // Data
    setupData,
    currentStep,
    stepStatus,
    progress,
    
    // State
    loading,
    error,
    autoSaving,
    lastSaved,
    validationErrors,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canProceed,
    canGoBack,
    
    // Actions
    completeSetup,
    
    // Data updates
    updateVerificationData,
    updateAgreementData,
    updateDefaultPoliciesData,
    updatePreferencesData,
    updateProfileData
  };
}; 