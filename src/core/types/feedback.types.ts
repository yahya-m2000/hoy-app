/**
 * Feedback Types
 * TypeScript type definitions for feedback system
 * 
 * @module @core/types/feedback
 */

export type FeedbackType = "bug_report" | "feature_request" | "improvement" | "general" | "complaint";

export type FeedbackCategory = "app_functionality" | "ui_ux" | "performance" | "payment" | "booking" | "property" | "account" | "other";

export type FeedbackPriority = "low" | "medium" | "high" | "critical";

export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed" | "duplicate";

export interface DeviceInfo {
  platform: "ios" | "android";
  version: string;
  deviceModel?: string;
  osVersion?: string;
}

export interface Feedback {
  _id: string;
  userId?: string;
  email?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  description: string;
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  deviceInfo?: DeviceInfo;
  attachments?: string[];
  isAnonymous: boolean;
  status: FeedbackStatus;
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  tags?: string[];
  upvotes?: number;
  relatedFeedback?: string[];
  feedbackId?: string; // Virtual field from backend
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  category: FeedbackCategory;
  priority?: FeedbackPriority;
  subject: string;
  description: string;
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  deviceInfo?: DeviceInfo;
  attachments?: string[];
  isAnonymous?: boolean;
  email?: string; // Required if anonymous
  tags?: string[];
}

export interface FeedbackFormData {
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  description: string;
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
  isAnonymous: boolean;
  email: string;
  tags: string[];
}

export interface FeedbackFormErrors {
  type?: string;
  category?: string;
  subject?: string;
  description?: string;
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  email?: string;
  general?: string;
}

export interface FeedbackApiResponse {
  success: boolean;
  data?: Feedback;
  message?: string;
  error?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data?: {
    feedback: Feedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// Form option types for UI
export interface FeedbackTypeOption {
  value: FeedbackType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface FeedbackCategoryOption {
  value: FeedbackCategory;
  label: string;
  description: string;
  icon: string;
}

export interface FeedbackPriorityOption {
  value: FeedbackPriority;
  label: string;
  color: string;
  icon: string;
}

// Constants for form options
export const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  {
    value: "bug_report",
    label: "Bug Report",
    description: "Report a bug or issue",
    icon: "bug-outline",
    color: "#ef4444"
  },
  {
    value: "feature_request",
    label: "Feature Request",
    description: "Suggest a new feature",
    icon: "bulb-outline",
    color: "#3b82f6"
  },
  {
    value: "improvement",
    label: "Improvement",
    description: "Suggest an improvement",
    icon: "trending-up-outline",
    color: "#10b981"
  },
  {
    value: "general",
    label: "General Feedback",
    description: "General comments or feedback",
    icon: "chatbubble-outline",
    color: "#6b7280"
  },
  {
    value: "complaint",
    label: "Complaint",
    description: "Report an issue or complaint",
    icon: "warning-outline",
    color: "#f59e0b"
  }
];

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  {
    value: "app_functionality",
    label: "App Functionality",
    description: "Core app features and functionality",
    icon: "phone-portrait-outline"
  },
  {
    value: "ui_ux",
    label: "UI/UX",
    description: "User interface and experience",
    icon: "color-palette-outline"
  },
  {
    value: "performance",
    label: "Performance",
    description: "App speed and performance",
    icon: "speedometer-outline"
  },
  {
    value: "payment",
    label: "Payment",
    description: "Payment and billing issues",
    icon: "card-outline"
  },
  {
    value: "booking",
    label: "Booking",
    description: "Booking process and management",
    icon: "calendar-outline"
  },
  {
    value: "property",
    label: "Property",
    description: "Property listings and details",
    icon: "home-outline"
  },
  {
    value: "account",
    label: "Account",
    description: "Account management and settings",
    icon: "person-outline"
  },
  {
    value: "other",
    label: "Other",
    description: "Other issues or feedback",
    icon: "ellipsis-horizontal-outline"
  }
];

export const FEEDBACK_PRIORITIES: FeedbackPriorityOption[] = [
  {
    value: "low",
    label: "Low",
    color: "#10b981",
    icon: "arrow-down-outline"
  },
  {
    value: "medium",
    label: "Medium",
    color: "#f59e0b",
    icon: "remove-outline"
  },
  {
    value: "high",
    label: "High",
    color: "#ef4444",
    icon: "arrow-up-outline"
  },
  {
    value: "critical",
    label: "Critical",
    color: "#7c2d12",
    icon: "alert-outline"
  }
];

// Utility types for form handling
export type FeedbackFormStep = "type" | "category" | "details" | "priority" | "review";

export interface FeedbackFormState {
  currentStep: FeedbackFormStep;
  data: Partial<FeedbackFormData>;
  errors: FeedbackFormErrors;
  isSubmitting: boolean;
  showPreview: boolean;
}

// Hook return types
export interface UseCreateFeedbackReturn {
  createFeedback: (data: CreateFeedbackData) => Promise<Feedback>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  reset: () => void;
}

export interface UseUserFeedbackReturn {
  feedback: Feedback[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
} 