/**
 * Shared Module
 * 
 * Exports pure UI components, utility hooks, assets, and styles.
 * No business logic or feature-specific components should be here.
 */

// UI Components
export * from './components/base';
export * from './components/layout';
export * from './components/feedback';
export * from './components/navigation';
export * from './components/form';
export * from './components/display';
export * from './components/overlay';

// Utility Hooks (no business logic)
export * from './hooks';

// Assets
export * from './assets';

// Styles
export * from './styles';

// Types
export * from './types';

// Debug components (only in development)
if (__DEV__) {
  module.exports = {
    ...module.exports,
    ...require('./components/debug')
  };
}
