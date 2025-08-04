/**
 * HostTabBarSkeleton component
 * Specific skeleton for host tab bar (4 tabs: Today, Calendar, Listings, Profile)
 */

import React from 'react';
import { TabBarSkeleton } from './TabBarSkeleton';

export const HostTabBarSkeleton: React.FC = () => {
  return (
    <TabBarSkeleton
      tabCount={4}
      showLabels={true}
    />
  );
};

export default HostTabBarSkeleton;