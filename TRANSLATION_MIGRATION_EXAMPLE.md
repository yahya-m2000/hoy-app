# Translation Key Migration Example

This document shows concrete examples of how translation keys will change with the new modular structure.

## Before (Current Structure)

```typescript
// Current fragmented usage across multiple files
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// Keys scattered across different files:
t("common.save")                    // from common.json
t("common.cancel")                  // from common.json  
t("common.loading")                 // from common.json
t("auth.signUp")                    // from auth.json
t("auth.validation.emailInvalid")   // from auth.json
t("ui.validation.required")         // from ui.json
t("property.errors.saveError")      // from property/errors.json
t("booking.upcoming")               // from booking.json
t("search.title")                   // from search.json
```

## After (New Modular Structure)

```typescript
// New organized, predictable structure
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// Clear, hierarchical organization:
t("common.actions.save")                        // from common/actions.json
t("common.actions.cancel")                      // from common/actions.json
t("common.states.loading")                      // from common/states.json
t("features.auth.forms.signUp")                 // from features/auth/forms.json
t("features.auth.forms.validation.emailInvalid") // from features/auth/forms.json
t("ui.forms.validation.required")               // from ui/forms.json
t("features.property.management.errors.saveError") // from features/property/management/errors.json
t("features.booking.management.upcoming")        // from features/booking/management.json
t("features.search.filters.title")              // from features/search/filters.json
```

## Key Benefits Demonstrated

### 1. **Predictable Structure**
```typescript
// Old: Where is email validation?
t("auth.validation.emailInvalid")  // Could be in auth.json or ui.json?

// New: Clear location
t("features.auth.forms.validation.emailInvalid")  // Obviously in features/auth/forms.json
```

### 2. **Logical Grouping**
```typescript
// Old: Actions scattered everywhere  
t("common.save")
t("common.cancel")
t("booking.confirmCancel")  // Different file!

// New: All actions in one place
t("common.actions.save")
t("common.actions.cancel")
t("features.booking.management.cancellation.confirmCancel")
```

### 3. **Easy to Extend**
```typescript
// Adding new property validation is obvious:
t("features.property.listing.validation.titleRequired")
t("features.property.listing.validation.descriptionRequired")

// Adding new booking states is clear:
t("features.booking.flow.status.pending")
t("features.booking.flow.status.confirmed")
```

### 4. **Component Example**

**Before:**
```typescript
// SignUpForm.tsx - Keys from multiple files
export default function SignUpForm() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t("auth.signUp")}</Text>              // auth.json
      <Input 
        label={t("auth.firstName")}                // auth.json
        error={t("auth.validation.firstNameRequired")} // auth.json
      />
      <Button>{t("common.save")}</Button>         // common.json
      <Text>{t("ui.validation.required")}</Text>  // ui.json
    </View>
  );
}
```

**After:**
```typescript
// SignUpForm.tsx - Clear, predictable keys
export default function SignUpForm() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t("features.auth.forms.signUp")}</Text>
      <Input 
        label={t("features.auth.forms.fields.firstName")}
        error={t("features.auth.forms.validation.firstNameRequired")}
      />
      <Button>{t("common.actions.save")}</Button>
      <Text>{t("ui.forms.validation.required")}</Text>
    </View>
  );
}
```

## File Structure Comparison

### Before:
```
locales/en/
├── common.json          # Mixed: actions, states, misc
├── auth.json           # Mixed: forms, validation, social
├── ui.json             # Mixed: validation, navigation
├── property/
│   ├── errors.json     # Only errors
│   ├── steps.json      # Only steps
│   └── ...            # 13 different files
```

### After:
```
locales/en/
├── common/
│   ├── actions.json    # Pure: all actions
│   ├── states.json     # Pure: all states
│   └── ...
├── ui/
│   ├── forms.json      # Pure: form-related UI
│   ├── feedback.json   # Pure: feedback UI
│   └── ...
├── features/
│   ├── auth/
│   │   ├── forms.json      # Pure: auth forms
│   │   ├── social.json     # Pure: social auth
│   │   └── legal.json      # Pure: legal/terms
│   └── property/
│       ├── listing/
│       │   ├── forms.json      # Pure: listing forms
│       │   ├── steps.json      # Pure: listing steps
│       │   └── validation.json # Pure: listing validation
│       └── details/
│           ├── types.json    # Pure: property types
│           ├── amenities.json # Pure: amenities
│           └── ...
```

This new structure makes it incredibly easy for developers to:
1. **Find** the right translation key
2. **Add** new keys in the logical location
3. **Maintain** and organize translations
4. **Scale** the app with new features