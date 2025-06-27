# Host Settings Module

A clean, DRY, and modular implementation of the host settings screen with proper separation of concerns and host QR code functionality.

## Structure

```
app/(tabs)/host/settings/
├── _layout.tsx                 # Navigation layout for modal QR screen
├── qr-code.tsx                 # QR code modal screen
├── components/                 # UI Components
│   ├── HostSettingsContent.tsx    # Main content with scroll view
│   ├── HostSettingsSections.tsx   # Renders all sections
│   ├── HostProfileHeader.tsx      # Profile header with QR code button
│   ├── HostQRCodeScreen.tsx       # Instagram-style QR code display
│   └── index.ts                   # Component exports
├── hooks/                      # Custom Hooks
│   ├── useHostSettings.ts         # Main settings hook
│   └── index.ts                   # Hook exports
├── services/                   # Business Logic
│   ├── ActionService.ts           # Action handlers
│   ├── ConfigService.ts           # Settings configuration
│   └── index.ts                   # Service exports
├── utils/                      # Types & Constants
│   ├── types.ts                   # TypeScript types
│   ├── constants.ts               # Constants
│   └── index.ts                   # Utility exports
└── index.tsx                   # Main screen (clean entry point)
```

## Key Features

### 🧩 **Modular Design**
- Each concern is separated into its own module
- Components are composable and reusable
- Services are dependency-injected for testability

### 🔄 **DRY Principle**
- No code duplication
- Shared types and constants
- Reusable action handlers

### 📱 **QR Code System**
- Instagram-style QR code display with host branding
- Modal navigation with smooth animations
- Integration with host profile data from shared hooks
- Stylized QR code with app logo in center (configurable)

### 🎯 **Single Responsibility**
- `ActionService`: Handles all user actions
- `ConfigService`: Generates settings configurations
- `HostProfileHeader`: Displays user profile and QR button
- `HostQRCodeScreen`: Dedicated QR code display with share functionality
- `useHostSettings`: Coordinates services and provides data
- Components: Pure UI rendering

### 🧪 **Testable**
- Services accept dependencies through constructor injection
- Pure functions for configuration generation
- Hooks can be easily mocked

## Usage

### Adding New Settings Items

1. **Add the action type** to `utils/types.ts`:
```typescript
export type HostSettingsAction = 
  | 'existing-actions'
  | 'new-action';
```

2. **Add the constant** to `utils/constants.ts`:
```typescript
export const SETTINGS_ACTIONS = {
  // ...existing
  'new-action': 'new-action',
};
```

3. **Add action handler** to `services/ActionService.ts`:
```typescript
handleNewAction = () => {
  // Implementation
};

getActionHandler = (action: HostSettingsAction): (() => void) => {
  switch (action) {
    // ...existing cases
    case 'new-action':
      return this.handleNewAction;
    default:
      return this.handleComingSoon;
  }
};
```

4. **Add to configuration** in `services/ConfigService.ts`:
```typescript
// Add to appropriate section's items array
{
  id: SETTINGS_ACTIONS['new-action'],
  icon: "icon-name",
  title: t("translation.key"),
  subtitle: t("translation.subtitle"),
  action: getActionHandler('new-action'),
}
```

### Extending Functionality

- **New Sections**: Add methods to `ConfigService` and update `getAllSections()`
- **Custom Actions**: Extend `ActionService` with new handler methods
- **UI Variations**: Create new components in `components/` folder
- **Additional Data**: Extend the hook or create new hooks

## Dependencies

- `@shared/context`: For user role and toast functionality
- `react-i18next`: For internationalization
- `@modules/account/components/Sections`: Base settings section component
- `@shared/components/base`: Screen component
- `@shared/constants`: Spacing constants

## Benefits

1. **Maintainability**: Easy to modify individual pieces without affecting others
2. **Scalability**: Simple to add new settings without code duplication
3. **Testability**: Each service and hook can be tested in isolation
4. **Readability**: Clear separation makes code easy to understand
5. **Reusability**: Components and services can be reused in other contexts
