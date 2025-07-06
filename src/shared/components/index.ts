/**
 * Shared Components
 * 
 * All pure UI components organized by category
 */

// Base components - atomic UI elements
export * from './base';

// Layout components - structure and spacing
export * from './layout';

// Feedback components - loading, errors, toasts
export * from './feedback';

// Navigation components - headers, tabs, navigation UI
export * from './navigation';

// Form components - inputs, calendars, form elements
export * from './form';

// Display components - cards, lists, carousels
export * from './display';

// Overlay components - modals, sheets, overlays
export * from './overlay';

// Debug components (development only)
export * from './debug';

export { default as AvatarPicker } from "./form/AvatarPicker";
export { default as AutocompleteInput } from "./AutocompleteInput";
