import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { HostSetupService } from "@core/api/services/host/setup.service";
import { useUserRole } from "@core/context";
import {
  HostSetupData,
  HostSetupStatus,
  HostVerification,
  HostAgreement,
  HostDefaultPolicies,
  HostPreferences,
  HostProfile,
  HostSetupStatusResponse,
} from "@core/types/host.types";

export type SetupStep = 'verification' | 'agreement' | 'policies' | 'preferences' | 'profile';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface UseHostSetupReturn {
  // State
  setupData: HostSetupData | null;
  currentStep: SetupStep;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Step status
  stepStatuses: Record<SetupStep, StepStatus>;
  overallProgress: number;
  canNavigateToStep: (step: SetupStep) => boolean;
  
  // Actions
  setCurrentStep: (step: SetupStep) => void;
  updateVerification: (data: Partial<HostVerification>) => Promise<void>;
  updateAgreement: (data: Partial<HostAgreement>) => Promise<void>;
  updatePolicies: (data: Partial<HostDefaultPolicies>) => Promise<void>;
  updatePreferences: (data: Partial<HostPreferences>) => Promise<void>;
  updateProfile: (data: Partial<HostProfile>) => Promise<void>;
  completeSetup: () => Promise<void>;
  
  // Verification actions
  sendEmailVerification: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  sendPhoneVerification: () => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<void>;
  uploadIdentityDocument: (document: any) => Promise<void>;
  
  // Auto-save
  enableAutoSave: boolean;
  setEnableAutoSave: (enabled: boolean) => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  getStepErrors: (step: SetupStep) => Record<string, string>;
  
  // Refresh
  refreshSetupData: () => Promise<void>;
}

const STEP_ORDER: SetupStep[] = ['verification', 'agreement', 'policies', 'preferences', 'profile'];

export const useHostSetupNew = (): UseHostSetupReturn => {
  const { t } = useTranslation();
  const { userRole } = useUserRole();
  
  // State
  const [setupData, setSetupData] = useState<HostSetupData | null>(null);
  const [currentStep, setCurrentStep] = useState<SetupStep>('verification');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enableAutoSave, setEnableAutoSave] = useState(true);
  
  // Auto-save timeout
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load initial setup data
  const loadSetupData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await HostSetupService.getSetupStatus();
      
      // Extract data from response
      const data: HostSetupData = {
        verification: response.data.verification,
        agreement: response.data.agreement,
        defaultPolicies: {
          cancellationPolicy: {
            type: 'flexible',
            refundPeriodDays: 14,
            fullRefundDays: 7,
            partialRefundDays: 3,
            noRefundDays: 1,
          },
          houseRules: {
            checkInTime: '15:00',
            checkOutTime: '11:00',
            smokingAllowed: false,
            petsAllowed: false,
            partiesAllowed: false,
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00',
            },
            additionalRules: [],
          },
          checkInPreferences: {
            selfCheckIn: false,
            keyPickup: true,
            meetAndGreet: false,
          },
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
            payments: true,
          },
        },
        profile: {
          bio: '',
          photo: '',
          languages: ['en'],
          isSuperhost: false,
        },
        setupStatus: {
          currentStep: response.data.currentStep,
          completedSteps: response.data.completedSteps,
          isComplete: response.data.isSetupComplete,
        },
      };
      
      setSetupData(data);
      
      // Set current step based on progress
      const nextStep = getNextIncompleteStep(data);
      setCurrentStep(nextStep);
      
    } catch (err: any) {
      console.error('Failed to load setup data:', err);
      setError(err.message || t('host.errors.loadSetupFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Get next incomplete step
  const getNextIncompleteStep = (data: HostSetupData): SetupStep => {
    if (!data.verification.isEmailVerified || !data.verification.isPhoneVerified) {
      return 'verification';
    }
    if (!data.agreement.termsAccepted || !data.agreement.privacyPolicyAccepted) {
      return 'agreement';
    }
    if (!data.defaultPolicies.cancellationPolicy) {
      return 'policies';
    }
    if (!data.preferences.responseTime) {
      return 'preferences';
    }
    if (!data.profile.bio || !data.profile.photo) {
      return 'profile';
    }
    return 'verification'; // Default fallback
  };

  // Calculate step statuses
  const stepStatuses = useMemo((): Record<SetupStep, StepStatus> => {
    if (!setupData) {
      return {
        verification: 'pending',
        agreement: 'pending',
        policies: 'pending',
        preferences: 'pending',
        profile: 'pending',
      };
    }

    return {
      verification: (setupData.verification.isEmailVerified && 
                    setupData.verification.isPhoneVerified && 
                    setupData.verification.isIdentityVerified) ? 'completed' : 'pending',
      agreement: (setupData.agreement.termsAccepted && 
                 setupData.agreement.privacyPolicyAccepted && 
                 setupData.agreement.hostGuaranteeAccepted) ? 'completed' : 'pending',
      policies: (setupData.defaultPolicies.cancellationPolicy && 
                setupData.defaultPolicies.houseRules.additionalRules.length >= 0) ? 'completed' : 'pending',
      preferences: (setupData.preferences.responseTime && 
                   setupData.preferences.languages.length > 0) ? 'completed' : 'pending',
      profile: (setupData.profile.bio && 
               setupData.profile.photo) ? 'completed' : 'pending',
    };
  }, [setupData]);

  // Calculate overall progress
  const overallProgress = useMemo((): number => {
    const completedSteps = Object.values(stepStatuses).filter(status => status === 'completed').length;
    return (completedSteps / STEP_ORDER.length) * 100;
  }, [stepStatuses]);

  // Check if user can navigate to a specific step
  const canNavigateToStep = useCallback((step: SetupStep): boolean => {
    if (!setupData) return false;
    
    const stepIndex = STEP_ORDER.indexOf(step);
    const currentStepIndex = STEP_ORDER.indexOf(currentStep);
    
    // Can always go to current or previous steps
    if (stepIndex <= currentStepIndex) return true;
    
    // Can go to next step if current step is completed
    if (stepIndex === currentStepIndex + 1) {
      return stepStatuses[currentStep] === 'completed';
    }
    
    // Cannot skip steps
    return false;
  }, [setupData, currentStep, stepStatuses]);

  // Auto-save function
  const autoSave = useCallback(async (step: SetupStep, data: any) => {
    if (!enableAutoSave) return;
    
    // Check if user is in host role before auto-saving
    if (userRole !== "host") {
      console.log('Auto-save skipped: User not in host role');
      return;
    }
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(async () => {
      try {
        console.log(`Auto-saving ${step} data:`, data);
        await HostSetupService.updateStep(step, data);
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }, 2000); // 2 second delay
    
    setAutoSaveTimeout(timeout);
  }, [enableAutoSave, autoSaveTimeout, userRole]);

  // Update functions
  const updateVerification = useCallback(async (data: Partial<HostVerification>) => {
    if (!setupData) return;
    
    try {
      setIsSaving(true);
      const response = await HostSetupService.updateVerification({ verification: data });
      setSetupData(prev => prev ? { ...prev, verification: { ...prev.verification, ...data } } : null);
      
      // Auto-save
      autoSave('verification', data);
    } catch (err: any) {
      setError(err.message || t('host.errors.updateFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [setupData, t, autoSave]);

  const updateAgreement = useCallback(async (data: Partial<HostAgreement>) => {
    if (!setupData) return;
    
    try {
      setIsSaving(true);
      const response = await HostSetupService.updateAgreement({ agreement: data });
      setSetupData(prev => prev ? { ...prev, agreement: { ...prev.agreement, ...data } } : null);
      
      // Auto-save
      autoSave('agreement', data);
    } catch (err: any) {
      setError(err.message || t('host.errors.updateFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [setupData, t, autoSave]);

  const updatePolicies = useCallback(async (data: Partial<HostDefaultPolicies>) => {
    if (!setupData) return;
    
    try {
      setIsSaving(true);
      const response = await HostSetupService.updateDefaultPolicies({ defaultPolicies: data });
      setSetupData(prev => prev ? { ...prev, defaultPolicies: { ...prev.defaultPolicies, ...data } } : null);
      
      // Auto-save
      autoSave('policies', data);
    } catch (err: any) {
      setError(err.message || t('host.errors.updateFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [setupData, t, autoSave]);

  const updatePreferences = useCallback(async (data: Partial<HostPreferences>) => {
    if (!setupData) return;
    
    try {
      setIsSaving(true);
      const response = await HostSetupService.updatePreferences({ preferences: data });
      setSetupData(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...data } } : null);
      
      // Auto-save
      autoSave('preferences', data);
    } catch (err: any) {
      setError(err.message || t('host.errors.updateFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [setupData, t, autoSave]);

  const updateProfile = useCallback(async (data: Partial<HostProfile>) => {
    if (!setupData) return;
    
    try {
      setIsSaving(true);
      const response = await HostSetupService.updateProfile({ profile: data });
      setSetupData(prev => prev ? { ...prev, profile: { ...prev.profile, ...data } } : null);
      
      // Auto-save
      autoSave('profile', data);
    } catch (err: any) {
      setError(err.message || t('host.errors.updateFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [setupData, t, autoSave]);

  // Verification actions
  const sendEmailVerification = useCallback(async () => {
    try {
      setIsSaving(true);
      // Note: This would need the actual email from user context
      await HostSetupService.sendEmailVerification('user@example.com');
      
      // Update verification status
      setSetupData(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          isEmailVerified: false // Will be updated when code is verified
        }
      } : null);
    } catch (err: any) {
      setError(err.message || t('host.errors.verificationFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  const verifyEmailCode = useCallback(async (code: string) => {
    try {
      setIsSaving(true);
      await HostSetupService.verifyEmailCode({ verificationId: 'temp-id', code });
      
      // Update verification status
      setSetupData(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          isEmailVerified: true
        }
      } : null);
    } catch (err: any) {
      setError(err.message || t('host.errors.verificationFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  const sendPhoneVerification = useCallback(async () => {
    try {
      setIsSaving(true);
      // Note: This would need the actual phone from user context
      await HostSetupService.sendPhoneVerification('+1234567890');
      
      // Update verification status
      setSetupData(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          isPhoneVerified: false // Will be updated when code is verified
        }
      } : null);
    } catch (err: any) {
      setError(err.message || t('host.errors.verificationFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  const verifyPhoneCode = useCallback(async (code: string) => {
    try {
      setIsSaving(true);
      await HostSetupService.verifyPhoneCode({ verificationId: 'temp-id', code });
      
      // Update verification status
      setSetupData(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          isPhoneVerified: true
        }
      } : null);
    } catch (err: any) {
      setError(err.message || t('host.errors.verificationFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  const uploadIdentityDocument = useCallback(async (document: any) => {
    try {
      setIsSaving(true);
      await HostSetupService.startIdentityVerification();
      
      // Update verification status
      setSetupData(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          isIdentityVerified: true
        }
      } : null);
    } catch (err: any) {
      setError(err.message || t('host.errors.verificationFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  // Complete setup
  const completeSetup = useCallback(async () => {
    try {
      setIsSaving(true);
      await HostSetupService.completeSetup();
      
      // Update setup status
      setSetupData(prev => prev ? {
        ...prev,
        setupStatus: {
          ...prev.setupStatus,
          isComplete: true,
          setupCompletedAt: new Date()
        }
      } : null);
      
      Alert.alert(
        t('host.setup.success.title'),
        t('host.setup.success.message'),
        [{ text: t('common.ok') }]
      );
    } catch (err: any) {
      setError(err.message || t('host.errors.setupFailed'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  // Validation
  const validateCurrentStep = useCallback((): boolean => {
    if (!setupData) return false;
    
    switch (currentStep) {
      case 'verification':
        return setupData.verification.isEmailVerified && 
               setupData.verification.isPhoneVerified;
      case 'agreement':
        return setupData.agreement.termsAccepted && 
               setupData.agreement.privacyPolicyAccepted;
      case 'policies':
        return !!setupData.defaultPolicies.cancellationPolicy;
      case 'preferences':
        return !!setupData.preferences.responseTime;
      case 'profile':
        return !!setupData.profile.bio && !!setupData.profile.photo;
      default:
        return false;
    }
  }, [setupData, currentStep]);

  const getStepErrors = useCallback((step: SetupStep): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!setupData) return errors;
    
    switch (step) {
      case 'verification':
        if (!setupData.verification.isEmailVerified) {
          errors.email = t('host.setup.errors.emailNotVerified');
        }
        if (!setupData.verification.isPhoneVerified) {
          errors.phone = t('host.setup.errors.phoneNotVerified');
        }
        break;
      case 'agreement':
        if (!setupData.agreement.termsAccepted) {
          errors.terms = t('host.setup.errors.termsNotAccepted');
        }
        if (!setupData.agreement.privacyPolicyAccepted) {
          errors.privacy = t('host.setup.errors.privacyNotAccepted');
        }
        break;
      case 'policies':
        if (!setupData.defaultPolicies.cancellationPolicy) {
          errors.cancellation = t('host.setup.errors.cancellationPolicyRequired');
        }
        break;
      case 'preferences':
        if (!setupData.preferences.responseTime) {
          errors.responseTime = t('host.setup.errors.responseTimeRequired');
        }
        break;
      case 'profile':
        if (!setupData.profile.bio) {
          errors.bio = t('host.setup.errors.bioRequired');
        }
        if (!setupData.profile.photo) {
          errors.photo = t('host.setup.errors.photoRequired');
        }
        break;
    }
    
    return errors;
  }, [setupData, t]);

  // Refresh setup data
  const refreshSetupData = useCallback(async () => {
    await loadSetupData();
  }, [loadSetupData]);

  // Load data on mount
  useEffect(() => {
    loadSetupData();
  }, [loadSetupData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    // State
    setupData,
    currentStep,
    isLoading,
    isSaving,
    error,
    
    // Step status
    stepStatuses,
    overallProgress,
    canNavigateToStep,
    
    // Actions
    setCurrentStep,
    updateVerification,
    updateAgreement,
    updatePolicies,
    updatePreferences,
    updateProfile,
    completeSetup,
    
    // Verification actions
    sendEmailVerification,
    verifyEmailCode,
    sendPhoneVerification,
    verifyPhoneCode,
    uploadIdentityDocument,
    
    // Auto-save
    enableAutoSave,
    setEnableAutoSave,
    
    // Validation
    validateCurrentStep,
    getStepErrors,
    
    // Refresh
    refreshSetupData,
  };
}; 