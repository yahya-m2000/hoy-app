# Host Calendar System

A comprehensive, feature-rich calendar system for property rental hosts (Airbnb-style) with support for availability management, dynamic pricing, reservations, and custom settings.

## Features

### Core Calendar Functionality
- **Monthly Grid View**: Native calendar grid with swipeable horizontal navigation
- **Date Selection**: Single date, range selection, and multi-date selection
- **Guest Booking Pills**: Visual indicators showing booked dates with guest avatars
- **Price Display**: Dynamic pricing display with base rates, custom pricing, and promotions
- **Availability Toggle**: Manual blocking/unblocking of dates
- **Real-time Updates**: Optimistic UI updates with server synchronization

### Advanced Features
- **Custom Pricing**: Per-night rate adjustments with currency support
- **Weekend Pricing**: Automatic weekend rate multipliers
- **Promotions**: Percentage-based discounts with visual indicators
- **Minimum Nights**: Configurable minimum stay requirements
- **Advance Notice**: Booking lead time requirements
- **Blocked Dates**: Manual blocking for maintenance or personal use

### User Interface
- **Native Header**: Month navigation with previous/next controls
- **Swipeable Navigation**: Horizontal swipe between months
- **Interactive Selection**: Touch and long-press for date selection
- **Action Bar**: Context-sensitive controls for selected dates
- **Modal Dialogs**: Dedicated modals for price editing and custom settings
- **Theme Support**: Light/dark theme compatibility

## Component Architecture

### Core Components

#### `HostCalendarPage`
Main container component that orchestrates the entire calendar experience.

```tsx
<HostCalendarPage
  propertyId="property-123"
  propertyName="Beautiful Beach House"
/>
```

#### `HostCalendar`
The main calendar grid component with swipe navigation.

```tsx
<HostCalendar
  propertyId="property-123"
  calendarData={calendarMonths}
  onDatePress={handleDatePress}
  onDateLongPress={handleLongPress}
  selectedDates={selectedDates}
  isRangeSelection={false}
  onMonthChange={handleMonthChange}
/>
```

#### `CalendarDay`
Individual calendar cell component showing booking status, pricing, and availability.

```tsx
<CalendarDay
  day={dayData}
  isSelected={isSelected}
  isInRange={isInRange}
  onPress={onDayPress}
  onLongPress={onDayLongPress}
/>
```

### Interactive Components

#### `CalendarSelectionActionBar`
Bottom action bar that appears when dates are selected.

```tsx
<CalendarSelectionActionBar
  selectedDates={selectedDates}
  isVisible={hasSelection}
  onCancel={handleCancel}
  onToggleAvailability={handleToggleAvailability}
  onEditPrice={handleEditPrice}
  onCustomSettings={handleCustomSettings}
  isAvailable={isSelectionAvailable}
/>
```

#### `PriceEditModal`
Modal for editing nightly rates with currency conversion.

```tsx
<PriceEditModal
  isVisible={showPriceModal}
  onClose={closePriceModal}
  onSave={handlePriceSave}
  currentPrice={currentPrice}
  currency="USD"
  selectedDates={selectedDates}
/>
```

#### `CustomSettingsModal`
Modal for configuring minimum nights, promotions, and other settings.

```tsx
<CustomSettingsModal
  isVisible={showSettingsModal}
  onClose={closeSettingsModal}
  onSave={handleSettingsSave}
  currentSettings={currentSettings}
  selectedDates={selectedDates}
/>
```

## Data Structures

### Calendar Day
```typescript
interface CalendarDay {
  date: string; // ISO date string (YYYY-MM-DD)
  isAvailable: boolean;
  price: number;
  currency: string;
  booking?: Booking;
  isBlocked?: boolean;
  blockReason?: 'maintenance' | 'personal' | 'other';
  isWeekend?: boolean;
  customPrice?: number;
  minimumNights?: number;
  promotionPercentage?: number;
}
```

### Booking Information
```typescript
interface Booking {
  id: string;
  propertyId: string;
  guest: Guest;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
  currency: string;
}
```

### Guest Information
```typescript
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
}
```

## State Management

The calendar uses React Query for server state management with optimistic updates:

```typescript
// Fetch calendar data
const { data: calendarData, error } = usePropertyCalendar(propertyId);

// Mutations for updates
const { updateCalendar, updateAvailability, updatePricing } = 
  useCalendarMutations(propertyId);
```

## API Integration

### Endpoints
- `GET /host/properties/{propertyId}/calendar` - Fetch calendar data
- `PATCH /host/properties/{propertyId}/calendar` - Update calendar
- `PUT /host/properties/{propertyId}/availability` - Update availability
- `PUT /host/properties/{propertyId}/pricing` - Update pricing

### Update Requests
```typescript
interface CalendarUpdateRequest {
  propertyId: string;
  updates: {
    date: string;
    isAvailable?: boolean;
    price?: number;
    minimumNights?: number;
    promotionPercentage?: number;
    isBlocked?: boolean;
    blockReason?: string;
  }[];
}
```

## Usage Examples

### Basic Integration
```tsx
import { HostCalendarPage } from '@/modules/host/components/calendar';

function PropertyCalendarScreen({ route }) {
  const { propertyId } = route.params;
  
  return (
    <HostCalendarPage propertyId={propertyId} />
  );
}
```

### Custom Implementation
```tsx
import { HostCalendar, CalendarSelectionActionBar } from '@/modules/host/components/calendar';

function CustomCalendarView() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const { data: calendarData } = usePropertyCalendar(propertyId);
  
  return (
    <View>
      <HostCalendar
        propertyId={propertyId}
        calendarData={calendarData?.months}
        onDatePress={setSelectedDates}
        selectedDates={selectedDates}
      />
      <CalendarSelectionActionBar
        selectedDates={selectedDates}
        isVisible={selectedDates.length > 0}
        onCancel={() => setSelectedDates([])}
        // ... other handlers
      />
    </View>
  );
}
```

## Styling and Theming

The calendar system uses a theme-based approach with support for light and dark modes:

```typescript
const theme = useTheme();

// Theme structure
interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    success: string;
    error: string;
    background: string;
    surface: string;
    // ...
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}
```

## Key Features Implementation

### Guest Booking Pills
- Visual pill indicators that span across booked date ranges
- Guest avatar integration with fallback to initials
- Color-coded status indicators for different booking states

### Interactive Date Selection
- Single tap for individual date selection
- Long press to initiate range selection
- Multi-date selection with visual feedback
- Intuitive selection clearing and modification

### Dynamic Pricing
- Base pricing with weekend multipliers
- Custom per-night rate overrides
- Promotion percentage calculations
- Currency formatting and conversion support

### Availability Management
- Toggle between available and blocked states
- Custom block reasons (maintenance, personal, etc.)
- Visual indicators for blocked dates
- Bulk availability updates

### Mobile-First Design
- Touch-optimized interface
- Swipe navigation between months
- Responsive sizing for different screen sizes
- Accessibility support for screen readers

## Performance Considerations

- **Virtualization**: Large date ranges are efficiently rendered
- **Optimistic Updates**: UI updates immediately for better UX
- **Caching**: Calendar data is cached and invalidated strategically
- **Lazy Loading**: Month data is loaded on-demand
- **Debounced Updates**: Rapid selections are batched for API efficiency

## Accessibility

- Screen reader support for all interactive elements
- Proper focus management for navigation
- High contrast support for visual indicators
- Semantic HTML structure for assistive technologies

## Testing

The calendar system includes comprehensive testing coverage:

- Unit tests for utility functions
- Component tests for user interactions
- Integration tests for API communication
- E2E tests for complete user workflows

This calendar system provides a robust, user-friendly interface for hosts to manage their property availability, pricing, and bookings with a native mobile experience.
