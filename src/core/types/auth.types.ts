/**
 * Authentication Types
 * 
 * Comprehensive type definitions for authentication operations including:
 * - Login and registration credentials
 * - Token management
 * - User authentication state
 * - Auth context types
 * 
 * @module @core/types/auth.types
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// CREDENTIAL TYPES
// ========================================

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  /** User email address */
  email: string;
  /** User password */
  password: string;
}

/**
 * Registration credentials interface
 */
export interface RegisterCredentials {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** User role (optional, defaults to 'user') */
  role?: "user" | "host";
  /** Confirm password field */
  confirmPassword?: string;
  /** Terms agreement flag */
  agreeToTerms?: boolean;
  /** User phone number (optional) */
  phoneNumber?: string;
  /** Profile picture URL or base64 (optional) */
  profilePicture?: string;
  /** Address information (optional) */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
  };
}

/**
 * Password reset credentials
 */
export interface PasswordResetCredentials {
  /** Reset token */
  token: string;
  /** New password */
  newPassword: string;
  /** Confirm new password */
  confirmPassword?: string;
}

/**
 * Password change credentials
 */
export interface PasswordChangeCredentials {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Confirm new password */
  confirmPassword?: string;
}

// ========================================
// TOKEN TYPES
// ========================================

/**
 * Token pair interface
 */
export interface Tokens {
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration time (optional) */
  expiresIn?: number;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  /** New access token */
  accessToken: string;
  /** New refresh token */
  refreshToken: string;
  /** Token expiration time in seconds */
  expiresIn: number;
}

// ========================================
// USER TYPES
// ========================================

/**
 * Authenticated user interface
 */
export interface AuthUser {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** User role */
  role: "user" | "host" | "admin";
  /** Profile avatar URL */
  avatar?: string;
  /** Email verification status */
  emailVerified: boolean;
  /** Account creation date */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
}

// ========================================
// RESPONSE TYPES
// ========================================

/**
 * Login response interface
 */
export interface LoginResponse {
  /** Authenticated user data */
  user: AuthUser;
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration time */
  expiresIn?: number;
  /** Success message */
  message?: string;
}

/**
 * Registration response interface
 */
export interface RegisterResponse {
  /** Created user data */
  user: AuthUser;
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration time */
  expiresIn?: number;
  /** Success message */
  message?: string;
  /** Whether email verification is required */
  requiresVerification?: boolean;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  /** Success message */
  message: string;
  /** Whether reset email was sent */
  emailSent: boolean;
  /** Token expiration time */
  expiresIn?: number;
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  /** Success flag */
  success: boolean;
  /** Response message */
  message: string;
}

// ========================================
// AUTH CONTEXT TYPES
// ========================================

/**
 * Registration form state interface
 */
export interface RegistrationFormState {
  /** Form values */
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  avatar: string | null;
  agreeToTerms: boolean;
  /** Selected country data */
  selectedCountry: {
    name: string;
    code: string;
    flag: string;
  };
  /** Modal visibility states */
  countryModalVisible: boolean;
  cityModalVisible: boolean;
  /** Search states */
  countrySearch: string;
  citySearch: string;
  /** SSO data if signing up via SSO */
  ssoData: SSOSignupData | null;
}

/**
 * Registration form errors interface
 */
export interface RegistrationFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
}

/**
 * SSO signup data interface
 */
export interface SSOSignupData {
  provider: string;
  ssoId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

/**
 * Registration state management interface
 */
export interface RegistrationState {
  /** Current form state */
  formState: RegistrationFormState;
  /** Form validation errors */
  errors: RegistrationFormErrors;
  /** Loading state */
  loading: boolean;
  /** Whether form is valid */
  isValid: boolean;
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth check has completed */
  isAuthChecked: boolean;
  /** Current authenticated user */
  user: AuthUser | null;
  /** Check authentication state */
  checkAuthenticationState: () => Promise<void>;
  /** Mark user as unauthenticated */
  markAsUnauthenticated: () => void;
  /** Mark user as authenticated */
  markAsAuthenticated: (user?: AuthUser) => void;
  /** Login function */
  login: (email: string, password: string) => Promise<void>;
  /** Register function */
  register: (credentials: RegisterCredentials) => Promise<void>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Request password reset */
  requestPasswordReset: (email: string) => Promise<void>;
  /** Reset password with token */
  resetPassword: (credentials: PasswordResetCredentials) => Promise<void>;
  /** Test authentication flow */
  testAuthenticationFlow: () => Promise<void>;
  
  // Registration state management
  /** Registration form state */
  registrationState: RegistrationState;
  /** Update registration form field */
  updateRegistrationField: <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K]
  ) => void;
  /** Update multiple registration form fields */
  updateRegistrationFields: (fields: Partial<RegistrationFormState>) => void;
  /** Validate registration form */
  validateRegistrationForm: () => RegistrationFormErrors;
  /** Clear registration form errors */
  clearRegistrationErrors: () => void;
  /** Reset registration form to initial state */
  resetRegistrationForm: () => void;
  /** Set SSO signup data */
  setSSOSignupData: (data: SSOSignupData | null) => void;
  /** Handle registration submission */
  handleRegistration: () => Promise<void>;
}

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  /** Child components */
  children: React.ReactNode;
}

// ========================================
// UTILITY TYPES
// ========================================

/**
 * Auth action options for prompting user authentication
 */
export interface AuthActionOptions {
  /** Title for auth prompt */
  title?: string;
  /** Message for auth prompt */
  message?: string;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Callback after successful authentication */
  onSuccess?: () => void;
  /** Callback when authentication is cancelled */
  onCancel?: () => void;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  /** Whether token is valid */
  isValid: boolean;
  /** Token expiration date */
  expiresAt?: Date;
  /** Minutes until expiration */
  expiresInMinutes?: number;
  /** Validation error message */
  error?: string;
}

/**
 * Auth storage keys
 */
export interface AuthStorageKeys {
  /** Access token key */
  ACCESS_TOKEN: string;
  /** Refresh token key */
  REFRESH_TOKEN: string;
  /** User ID key */
  USER_ID: string;
  /** Token blacklist key */
  TOKEN_BLACKLISTED: string;
  /** Token invalidation key */
  TOKEN_INVALIDATED_AT: string;
}

// ========================================
// AUTH FORM TYPES
// ========================================

/**
 * Auth form field validation
 */
export interface AuthFieldValidation {
  /** Whether field is required */
  required?: boolean;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Regex pattern */
  pattern?: RegExp;
  /** Custom validation function */
  validator?: (value: string) => string | null;
}

/**
 * Auth form state
 */
export interface AuthFormState {
  /** Form values */
  values: Record<string, string>;
  /** Form errors */
  errors: Record<string, string>;
  /** Loading state */
  loading: boolean;
  /** Whether form is valid */
  isValid: boolean;
}

/**
 * Auth form props
 */
export interface AuthFormProps {
  /** Form type */
  type: 'login' | 'register' | 'forgot-password' | 'reset-password';
  /** Submit handler */
  onSubmit: (values: Record<string, string>) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Initial values */
  initialValues?: Record<string, string>;
  /** Form validation rules */
  validation?: Record<string, AuthFieldValidation>;
} 