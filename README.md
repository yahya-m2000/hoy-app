# Hoy Mobile App

[![Version](https://img.shields.io/badge/version-1.0.0--alpha.1-blue.svg)](https://github.com/yahya-m2000/hoy-app)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

A modern, secure, and feature-rich **React Native mobile application** for the Hoy platform. This cross-platform app enables property discovery, booking management, and real-time communication between hosts and travelers.

---

## ✨ Features

### 🔍 **Property Discovery & Search**
- **Advanced Search & Filters** with location, price, amenities, and date filtering
- **Interactive Maps** with platform-specific integration (Apple Maps for iOS, Google Maps for Android)
- **Property Listings** with high-quality images and detailed information
- **Real-time Availability** checking and booking status updates

### 📅 **Booking Management**
- **Seamless Booking Flow** with calendar integration and date selection
- **Payment Processing** with Stripe integration for secure transactions
- **Booking Status Tracking** with real-time updates and notifications
- **Calendar Sync** with device calendars (iOS Calendar, Google Calendar)
- **Location Services** with directions and navigation to properties

### 💬 **Communication & Messaging**
- **Real-time Messaging** between hosts and guests using Socket.IO
- **Push Notifications** for booking updates and messages
- **WhatsApp Integration** for direct host-guest communication
- **Multi-language Support** (English, Somali, Arabic, French) with RTL support

### 🏠 **Host Management Features**
- **Property Listing Management** with photo uploads and details
- **Reservation Dashboard** with booking status management
- **Guest Communication Tools** with integrated messaging
- **Revenue Tracking** with multi-currency conversion support

### 🔐 **Security & Authentication**
- **Multi-provider Authentication** (Auth0, Apple ID, Facebook)
- **Biometric Authentication** (Touch ID, Face ID)
- **Certificate Pinning** for secure API communication
- **Encrypted Local Storage** with Expo SecureStore
- **Token Management** with automatic refresh and encryption

### 🌐 **Internationalization & Accessibility**
- **4 Language Support** with complete i18n implementation
- **RTL Layout Support** for Arabic language
- **Currency Conversion** with real-time exchange rates
- **Accessibility Features** with screen reader support

---

## 🛠️ Tech Stack & Dependencies

### **Core Framework & Runtime**
- **React Native:** `0.79.5` (Cross-platform mobile development)
- **Expo:** `53.0.20` (Development platform and toolchain)
- **TypeScript:** `5.8.3` (Type-safe JavaScript with strict mode)
- **Expo Router:** `5.1.4` (File-based navigation system)

### **State Management & Data**
- **Context API** - Global state management
- **React Query:** `5.75.1` - Server state management and caching
- **AsyncStorage:** `2.1.2` - Local data persistence
- **Axios:** `1.9.0` - HTTP client with interceptors

### **UI/UX & Design System**
- **Custom Design System** - Consistent, modern UI components
- **React Native Reanimated:** `3.17.4` - Smooth animations and gestures
- **React Native Paper:** `5.14.5` - Material Design components
- **Expo Vector Icons:** `14.1.0` - Comprehensive icon library
- **React Native Gesture Handler:** `2.24.0` - Advanced gesture recognition

### **Maps & Location Services**
- **Expo Maps:** `0.11.0` - Native map integration
- **Expo Location:** `18.1.6` - GPS and location services
- **Platform-specific Maps** (Apple Maps for iOS, Google Maps for Android)

### **Authentication & Security**
- **React Native Auth0:** `5.0.0-beta.3` - Enterprise authentication
- **Expo Apple Authentication:** `7.2.4` - Sign in with Apple
- **React Native FBSDK:** `13.4.1` - Facebook authentication
- **Expo Local Authentication:** `16.0.5` - Biometric authentication
- **Expo Secure Store:** `14.2.3` - Encrypted storage
- **Crypto-JS:** `4.2.0` - Encryption utilities
- **JWT Decode:** `4.0.0` - Token management

### **Communication & Real-time Features**
- **Socket.IO Client:** `4.8.1` - Real-time messaging
- **Expo Notifications:** `0.31.4` - Push notifications
- **Expo Linking:** `7.1.7` - Deep linking and external app integration

### **Media & Device Features**
- **Expo Image:** `2.4.0` - Optimized image handling
- **Expo Image Picker:** `16.1.4` - Camera and photo library access
- **Expo Camera:** `16.1.10` - Camera functionality
- **Expo Media Library:** `17.1.7` - Media access and management
- **React Native QR Code SVG:** `6.3.15` - QR code generation

### **Internationalization & Localization**
- **i18next:** `25.0.2` - Internationalization framework
- **React i18next:** `15.5.1` - React integration for i18n
- **Expo Localization:** `16.1.6` - Device locale detection

### **Payment & Business Logic**
- **Stripe React Native:** `0.45.0` - Payment processing
- **Date-fns:** `4.1.0` - Date manipulation and formatting
- **React Native Calendars:** `1.1312.0` - Calendar components

### **Development & Testing**
- **Expo Dev Client:** `5.2.4` - Custom development client
- **TypeScript:** `5.8.3` - Static type checking
- **ESLint:** `9.25.0` - Code linting and quality

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- iOS Simulator (macOS) or Android Studio
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoy-app
   ```

2. **Install dependencies**
   ```bash
# Hoy Mobile App

[![Version](https://img.shields.io/badge/version-1.1.1--alpha.1-blue.svg)](https://github.com/yahya-m2000/hoy-app)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

A modern, secure, and feature-rich **React Native mobile application** for the Hoy platform. This cross-platform app enables property discovery, booking management, and real-time communication between hosts and travelers.

---

## ✨ Features

### 🔍 **Property Discovery & Search**
- **Advanced Search & Filters** with location, price, amenities, and date filtering
- **Interactive Maps** with platform-specific integration (Apple Maps for iOS, Google Maps for Android)
- **Property Listings** with high-quality images and detailed information
- **Real-time Availability** checking and booking status updates

### 📅 **Booking Management**
- **Seamless Booking Flow** with calendar integration and date selection
- **Payment Processing** with Stripe integration for secure transactions
- **Booking Status Tracking** with real-time updates and notifications
- **Calendar Sync** with device calendars (iOS Calendar, Google Calendar)
- **Location Services** with directions and navigation to properties

### 💬 **Communication & Messaging**
- **Real-time Messaging** between hosts and guests using Socket.IO
- **Push Notifications** for booking updates and messages
- **WhatsApp Integration** for direct host-guest communication
- **Multi-language Support** (English, Somali, Arabic, French) with RTL support

### 🏠 **Host Management Features**
- **Property Listing Management** with photo uploads and details
- **Reservation Dashboard** with booking status management
- **Guest Communication Tools** with integrated messaging
- **Revenue Tracking** with multi-currency conversion support

### 🔐 **Security & Authentication**
- **Multi-provider Authentication** (Auth0, Apple ID, Facebook)
- **Biometric Authentication** (Touch ID, Face ID)
- **Certificate Pinning** for secure API communication
- **Encrypted Local Storage** with Expo SecureStore
- **Token Management** with automatic refresh and encryption

### 🌐 **Internationalization & Accessibility**
- **4 Language Support** with complete i18n implementation
- **RTL Layout Support** for Arabic language
- **Currency Conversion** with real-time exchange rates
- **Accessibility Features** with screen reader support

---

## 🛠️ Tech Stack & Dependencies

### **Core Framework & Runtime**
- **React Native:** `0.79.5` (Cross-platform mobile development)
- **Expo:** `53.0.20` (Development platform and toolchain)
- **TypeScript:** `5.8.3` (Type-safe JavaScript with strict mode)
- **Expo Router:** `5.1.4` (File-based navigation system)

### **State Management & Data**
- **Context API** - Global state management
- **React Query:** `5.75.1` - Server state management and caching
- **AsyncStorage:** `2.1.2` - Local data persistence
- **Axios:** `1.9.0` - HTTP client with interceptors

### **UI/UX & Design System**
- **Custom Design System** - Consistent, modern UI components
- **React Native Reanimated:** `3.17.4` - Smooth animations and gestures
- **React Native Paper:** `5.14.5` - Material Design components
- **Expo Vector Icons:** `14.1.0` - Comprehensive icon library
- **React Native Gesture Handler:** `2.24.0` - Advanced gesture recognition

### **Maps & Location Services**
- **Expo Maps:** `0.11.0` - Native map integration
- **Expo Location:** `18.1.6` - GPS and location services
- **Platform-specific Maps** (Apple Maps for iOS, Google Maps for Android)

### **Authentication & Security**
- **React Native Auth0:** `5.0.0-beta.3` - Enterprise authentication
- **Expo Apple Authentication:** `7.2.4` - Sign in with Apple
- **React Native FBSDK:** `13.4.1` - Facebook authentication
- **Expo Local Authentication:** `16.0.5` - Biometric authentication
- **Expo Secure Store:** `14.2.3` - Encrypted storage
- **Crypto-JS:** `4.2.0` - Encryption utilities
- **JWT Decode:** `4.0.0` - Token management

### **Communication & Real-time Features**
- **Socket.IO Client:** `4.8.1` - Real-time messaging
- **Expo Notifications:** `0.31.4` - Push notifications
- **Expo Linking:** `7.1.7` - Deep linking and external app integration

### **Media & Device Features**
- **Expo Image:** `2.4.0` - Optimized image handling
- **Expo Image Picker:** `16.1.4` - Camera and photo library access
- **Expo Camera:** `16.1.10` - Camera functionality
- **Expo Media Library:** `17.1.7` - Media access and management
- **React Native QR Code SVG:** `6.3.15` - QR code generation

### **Internationalization & Localization**
- **i18next:** `25.0.2` - Internationalization framework
- **React i18next:** `15.5.1` - React integration for i18n
- **Expo Localization:** `16.1.6` - Device locale detection

### **Payment & Business Logic**
- **Stripe React Native:** `0.45.0` - Payment processing
- **Date-fns:** `4.1.0` - Date manipulation and formatting
- **React Native Calendars:** `1.1312.0` - Calendar components

### **Development & Testing**
- **Expo Dev Client:** `5.2.4` - Custom development client
- **TypeScript:** `5.8.3` - Static type checking
- **ESLint:** `9.25.0` - Code linting and quality

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- iOS Simulator (macOS) or Android Studio
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoy-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run env:setup
   # Edit .env file with your configuration
   npm run env:validate
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Physical iOS device (requires Apple Developer account)
   npm run prebuild:ios:device
   
   # Physical Android device
   npm run prebuild:android:device
   
   # Clear cache if needed
   npm run clear
   ```

---

## 📱 Development Commands

### **Development**
```bash
npm start                    # Start Expo development server
npm run android             # Run on Android emulator/device
npm run ios                 # Run on iOS simulator/device
npm run web                 # Run on web (limited functionality)
npm run clear               # Start with cleared cache
```

### **Building & Production**
```bash
npm run build:production    # Production build script
npm run build:validate     # Validate production build
npm run build:check        # Check build configuration
npm run build:config       # Configure build settings
npm run build:ios          # Build for iOS (EAS Build)
npm run build:android      # Build for Android (EAS Build)
npm run build:all          # Build for all platforms
```

### **Submission & Deployment**
```bash
npm run submit:ios         # Submit to App Store (EAS Submit)
npm run submit:android     # Submit to Google Play (EAS Submit)
```

### **Utilities & Maintenance**
```bash
npm run clean:cache        # Clean all caches and reinstall dependencies
npm run fix:pods           # Fix iOS CocoaPods issues (Apple Silicon)
npm run security:check     # Run security audit on dependencies
npm run test:certificate-pinning  # Test SSL certificate pinning
```

### **Prebuild & Native Development**
```bash
npm run prebuild          # Generate native code for both platforms
npm run prebuild:ios      # Generate and run iOS native code
npm run prebuild:android  # Generate and run Android native code
```

---

## 🏗 Project Architecture

### **Feature-Based Architecture**
```
src/
├── core/                  # Core application layer
│   ├── api/              # API client configuration and interceptors
│   ├── auth/             # Authentication logic and token management
│   ├── config/           # App configuration and constants
│   ├── context/          # Global React contexts (auth, currency, toast)
│   ├── design/           # Design system tokens and theme
│   ├── hooks/            # Custom React hooks
│   ├── locales/          # i18n translation files
│   ├── navigation/       # Navigation configuration
│   ├── security/         # Security utilities and certificate pinning
│   ├── types/            # Global TypeScript type definitions
│   └── utils/            # Utility functions and helpers
├── features/             # Feature modules (domain-driven)
│   ├── auth/             # Authentication features
│   ├── booking/          # Booking management and workflow
│   ├── calendar/         # Calendar integration and scheduling
│   ├── chat/             # Real-time messaging
│   ├── host/             # Host dashboard and property management
│   ├── properties/       # Property listings and details
│   ├── review/           # Review and rating system
│   ├── search/           # Property search and filtering
│   ├── user/             # User profile and account management
│   └── wishlist/         # Property favorites and wishlist
└── shared/               # Shared components and utilities
    ├── components/       # Reusable UI components
    │   ├── base/         # Base components (Button, Text, Container)
    │   ├── feedback/     # Loading, error, empty states
    │   ├── forms/        # Form components and inputs
    │   ├── layout/       # Layout and structural components
    │   └── navigation/   # Navigation-related components
    ├── hooks/            # Shared custom hooks
    ├── types/            # Shared TypeScript types
    └── assets/           # Images, fonts, and static assets
```

### **Import Aliases**
```typescript
"@core/*": ["src/core/*"]           // Core application layer
"@features/*": ["src/features/*"]   // Feature modules
"@shared/*": ["src/shared/*"]       // Shared components and utilities
```

### **File-based Routing (Expo Router)**
```
app/
├── (tabs)/              # Tab-based navigation
│   ├── traveler/        # Traveler-specific screens
│   └── host/            # Host-specific screens
├── auth/                # Authentication screens
├── onboarding/          # App onboarding flow
└── _layout.tsx          # Root layout configuration
```

---

## 🌍 Internationalization

### **Supported Languages**
- **English (en)** - Default language
- **Somali (so)** - Complete translation
- **Arabic (ar)** - RTL layout support included
- **French (fr)** - Complete translation

### **i18n Features**
- Dynamic language switching
- RTL (Right-to-Left) layout support for Arabic
- Pluralization support
- Date and number localization
- Currency formatting based on locale

---

## 🔒 Security Features

### **Authentication Security**
- Multi-provider authentication (Auth0, Apple, Facebook)
- Biometric authentication (Touch ID, Face ID)
- JWT token management with automatic refresh
- Secure token storage with encryption

### **Communication Security**
- Certificate pinning for API requests
- Request signing with HMAC verification
- Encrypted local storage for sensitive data
- Input sanitization and validation

### **Privacy & Data Protection**
- App tracking transparency (iOS)
- Secure data handling practices
- Encrypted messaging
- GDPR compliance features

---

## 🎯 Platform Support

### **iOS Support**
- **Minimum Version:** iOS 13.0+
- **Features:** Apple Maps, Apple Calendar, Sign in with Apple, Touch ID/Face ID
- **App Store:** Production builds via EAS Build

### **Android Support**
- **Minimum Version:** Android 8.0+ (API 26)
- **Features:** Google Maps, Google Calendar, Fingerprint authentication
- **Google Play:** Production builds via EAS Build

### **Cross-Platform Features**
- Consistent UI/UX across platforms
- Platform-specific optimizations
- Native module integration

---

## 📊 Project Status

### **Current Version:** `1.0.0-alpha.1`
### **Development Status:** 🟡 **Alpha Release**
### **Platform Compatibility:** 🟢 **iOS 13+ | Android 8+**
### **Build Status:** 🟢 **Production Ready**

### **Feature Completeness**
- **Authentication:** ✅ Complete
- **Property Search:** ✅ Complete
- **Booking Flow:** ✅ Complete
- **Real-time Messaging:** ✅ Complete
- **Host Dashboard:** ✅ Complete
- **Maps Integration:** ✅ Complete
- **Payment Processing:** ✅ Complete
- **Internationalization:** ✅ Complete

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

This is a private project. For internal team contributions, please follow the established development workflow:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** TypeScript and React Native best practices
4. **Test** your changes thoroughly
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript strict mode requirements
- Use existing design system components
- Maintain consistent code style
- Test on both iOS and Android platforms
- Update documentation for new features

---

<div align="center">

**⭐ Star this project if you find it helpful!**

Made with ❤️ using React Native and Expo

</div>