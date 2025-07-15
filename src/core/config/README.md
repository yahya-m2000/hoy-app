# Beta Configuration

This directory contains configuration files for controlling app features and behavior, particularly for beta testing.

## Beta Configuration (`beta.ts`)

The `BETA_CONFIG` object controls which features are enabled for beta testing. This makes it easy to:

- Skip verification steps during beta testing
- Enable/disable specific features
- Control UI/UX behavior
- Switch between beta and production modes

### Usage

```typescript
import { BETA_CONFIG, isStepEnabled } from '@core/config/beta';

// Check if verification is enabled
if (BETA_CONFIG.setup.includeVerification) {
  // Show verification step
}

// Check if a specific step is enabled
if (isStepEnabled('verification')) {
  // Show verification UI
}
```

### Configuration Options

#### Setup Steps
- `includeVerification`: Whether to include account verification step
- `includeAgreement`: Whether to include host agreement step
- `includePolicies`: Whether to include default policies step
- `includePreferences`: Whether to include host preferences step
- `includeProfile`: Whether to include host profile step

#### Features
- `advancedVerification`: Whether to show advanced verification options
- `requireIdentityVerification`: Whether to require identity verification
- `detailedPolicyExplanations`: Whether to show detailed policy explanations
- `autoSave`: Whether to enable auto-save functionality

#### UI/UX
- `showProgress`: Whether to show progress indicators
- `showHelpText`: Whether to show help text and tips
- `immediateValidation`: Whether to show validation errors immediately

### Switching to Production

To switch from beta to production mode:

1. Set `isBeta: false` in `BETA_CONFIG`
2. Set all setup steps to `true` that should be required in production
3. Configure feature flags as needed for production

### Example: Beta vs Production

```typescript
// Beta configuration (current)
export const BETA_CONFIG = {
  isBeta: true,
  setup: {
    includeVerification: false,  // Skip for beta testing
    includeAgreement: true,
    includePolicies: true,
    includePreferences: true,
    includeProfile: true,
  }
};

// Production configuration
export const BETA_CONFIG = {
  isBeta: false,
  setup: {
    includeVerification: true,   // Required in production
    includeAgreement: true,
    includePolicies: true,
    includePreferences: true,
    includeProfile: true,
  }
};
``` 