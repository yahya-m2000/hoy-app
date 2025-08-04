/**
 * TravelerTabBarSkeleton component
 * Specific skeleton for traveler tab bar (5 tabs: Home, Search, Bookings, Wishlist, Profile)
 */

import React from 'react';
import { TabBarSkeleton } from './TabBarSkeleton';

export const TravelerTabBarSkeleton: React.FC = () => {
  return (
    <TabBarSkeleton
      tabCount={5}
      showLabels={true}
    />
  );
};

export default TravelerTabBarSkeleton;