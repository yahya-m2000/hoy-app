/**
 * useTabBarCoordination Hook
 * Coordinates tab bar visibility with screen loading states
 * Allows screens to communicate their loading status to the tab bar
 */

import { useState, useCallback, useContext, createContext, ReactNode } from 'react';

interface TabBarCoordinationContextType {
  /** Current screen loading state */
  isScreenLoading: boolean;
  /** Set loading state for current screen */
  setScreenLoading: (loading: boolean) => void;
  /** Whether tab bar should be hidden due to loading */
  shouldHideTabBar: boolean;
}

const TabBarCoordinationContext = createContext<TabBarCoordinationContextType | null>(null);

/**
 * Provider component for tab bar coordination
 */
export const TabBarCoordinationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  
  const setScreenLoading = useCallback((loading: boolean) => {
    setIsScreenLoading(loading);
  }, []);

  const shouldHideTabBar = isScreenLoading;

  return (
    <TabBarCoordinationContext.Provider 
      value={{ 
        isScreenLoading, 
        setScreenLoading, 
        shouldHideTabBar 
      }}
    >
      {children}
    </TabBarCoordinationContext.Provider>
  );
};

/**
 * Hook to coordinate tab bar visibility with screen loading
 */
export const useTabBarCoordination = () => {
  const context = useContext(TabBarCoordinationContext);
  
  if (!context) {
    throw new Error('useTabBarCoordination must be used within TabBarCoordinationProvider');
  }
  
  return context;
};

export default useTabBarCoordination;