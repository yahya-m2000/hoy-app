# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a React Native mobile application called "Hoy" - a property booking platform built with Expo. The project structure consists of:

- `app/` - Expo Router-based app structure with file-based routing
- `src/` - Source code organized by architectural layers
- `assets/` - Static assets (fonts, images, icons)
- `ios/` - Native iOS configuration and resources

### Mobile App Architecture

The mobile app follows a feature-based architecture with clean separation of concerns:

- **Core Layer** (`src/core/`): Authentication, API client, storage, navigation, design system, security, types, utilities
- **Feature Layer** (`src/features/`): Domain-specific features (auth, booking, properties, search, host management, etc.)
- **Shared Layer** (`src/shared/`): Reusable UI components, hooks, types, assets

Key architectural patterns:
- Feature-driven development with domain separation
- Context API for global state management
- TypeScript path aliases for clean imports (@core/*, @features/*, @shared/*)
- Modular service architecture with centralized API client
- Security-first design with token encryption, certificate pinning, and input sanitization

## Common Development Commands

### Mobile App

```bash
# Development
npm start                    # Start Expo development server
npm run android             # Run on Android emulator/device
npm run ios                 # Run on iOS simulator/device
npm run clear               # Start with cleared cache

# Building & Production
npm run build:production    # Production build script
npm run build:ios          # Build for iOS (EAS)
npm run build:android      # Build for Android (EAS)
npm run build:all          # Build for all platforms

# Utilities
npm run clean:cache        # Clean all caches and reinstall
npm run fix:pods           # Fix iOS CocoaPods issues (Apple Silicon)
```

## Key Technologies & Dependencies

### Mobile App
- **React Native 0.79** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation** for routing
- **Context API** for state management
- **Axios** for API requests with interceptors
- **React Query** for server state management
- **i18next** for internationalization (Somali, English, Arabic, French)
- **Socket.IO** for real-time messaging
- **Expo modules** for device features (camera, location, notifications, etc.)

## Code Organization Patterns & Modularity Goals

### Mobile App Import Aliases
- `@core/*` - Core application layer (api, auth, config, context, design, locales, navigation, security, types, utils)
- `@features/*` - Feature modules (account, auth, booking, calendar, chat, host, properties, review, search, user, wishlist)
- `@shared/*` - Shared components, hooks, styles, types, assets

## Critical Modularity Principles

### Component Reusability & DRY Principle
**ALWAYS follow this workflow before adding any new component or functionality:**

1. **Check if it exists already** - Search `@shared/components` and existing features
2. **Use existing components first** - Import from `@shared/components` instead of creating new ones
3. **Prefer shared abstractions** - Use shared components over direct React Native imports
4. **Eliminate duplicates** - If you find duplicate functionality, merge or remove redundant copies
5. **Move misplaced components** - Components in `@features/*` that could be reused should move to `@shared/*`

### Import Hierarchy (Mobile App)
**Preferred import order:**
1. `@shared/components/*` - Use shared UI components first
2. `@core/*` - Core functionality and utilities  
3. Direct React Native imports - Only when shared alternatives don't exist
4. Third-party libraries - As last resort for new functionality

### Examples of Proper Component Organization

**✅ Correct Approach:**
```typescript
// Use shared components
import { Button, Text, Container } from '@shared/components/base';
import { EmptyState } from '@shared/components/feedback';
import { Card } from '@shared/components/layout';
```

**❌ Avoid This:**
```typescript
// Don't create feature-specific duplicates
import { View, Text, TouchableOpacity } from 'react-native';
// Don't recreate existing shared components
```

### Component Location Guidelines

**Move to `@shared/components` if:**
- Used by 2+ features
- Provides general UI functionality
- Could be useful across different user types (host/traveler)
- Implements common patterns (forms, lists, modals, etc.)

**Keep in `@features/*` only if:**
- Highly domain-specific business logic
- Contains feature-specific state management
- Tightly coupled to specific user flows

### Before Making Any Changes
1. **Search existing codebase** for similar functionality
2. **Check shared components** structure and available components
3. **Identify reusable patterns** that could benefit other features
4. **Consolidate duplicates** before adding new functionality

## Testing Strategy & Guidelines

### Mobile App Testing Roadmap

#### Phase 1: Foundation (Current)
- **Setup**: Jest and React Native Testing Library configuration
- **Coverage**: Basic component rendering and navigation tests
- **Commands**: 
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode for development
  - `npm run test:coverage` - Generate coverage reports

#### Phase 2: Component Testing (Next)
- **Shared Components**: Test all components in `@shared/components`
- **Feature Components**: Test feature-specific components
- **Integration**: Test component integration with Context API
- **Accessibility**: Screen reader and accessibility testing

#### Phase 3: E2E Testing (Future)
- **Technology**: Detox for React Native E2E testing
- **Coverage**: Complete user workflows (auth, booking, search)
- **Platforms**: iOS simulator and Android emulator testing
- **CI Integration**: Automated E2E tests in GitHub Actions

#### Phase 4: Advanced Testing (Future)
- **Performance**: Bundle size analysis and performance testing
- **Security**: Certificate pinning and encryption testing
- **Offline**: Offline functionality and data synchronization
- **Platform**: Platform-specific behavior testing

### Testing Commands Reference

#### Mobile App Testing Commands (Planned)
```bash
# Run all mobile tests
npm test

# Component tests only
npm run test:components

# Integration tests
npm run test:integration

# E2E tests (future)
npm run test:e2e
npm run test:e2e:ios
npm run test:e2e:android

# Performance tests (future)
npm run test:performance

# Security tests (future)
npm run test:security
npm run test:certificate-pinning
```

### Continuous Integration Strategy

#### Pre-commit Hooks (Future Implementation)
- Lint and type checking
- Unit test execution
- Code formatting with Prettier
- Commit message validation

#### Branch Protection Rules
- Require passing CI checks before merge
- Require code review approval
- Up-to-date branch requirement
- Dismiss stale reviews on new commits

#### Quality Gates
- **Test Coverage**: Minimum 80% line coverage
- **Security**: No high/critical vulnerabilities
- **Performance**: Build time under 5 minutes
- **Type Safety**: Zero TypeScript errors in strict mode

## Important Notes

### Mobile App
- Supports both host and traveler user types with different UI flows
- Real-time messaging is implemented with Socket.IO client
- Comprehensive i18n support for multiple languages (Somali, English, Arabic, French)
- Security-first design with token encryption and certificate pinning
- Built with Expo Router for file-based navigation
- TypeScript for type safety across the entire codebase