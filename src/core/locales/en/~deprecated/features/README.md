# Deprecated Features

This directory contains deprecated feature translation files that are no longer in use.

## Moved Files

### Profile
- **Moved**: `features/profile/` → `~deprecated/features/profile/`
- **Reason**: Replaced by `features/account/profile.json`
- **Date**: 2025-01-27
- **Status**: Fully commented out and deprecated

## Migration Notes

All profile-related translations have been consolidated into:
- `features/account/profile.json` - Main profile translations
- `features/account/qrCode.json` - QR code profile viewing

The old `features/profile/index.json` structure has been deprecated to avoid duplication and maintain cleaner architecture.