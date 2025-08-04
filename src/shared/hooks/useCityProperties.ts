/**
 * Custom hook to fetch properties for multiple cities
 * Uses a single useProperties call to avoid conditional hooks
 */

import { useMemo, useState, useEffect } from 'react';
import { useProperties } from 'src/features/properties/hooks/useProperties';
import { PropertyType } from '@core/types/property.types';

export interface CityPropertiesResult {
  [cityName: string]: {
    properties: PropertyType[];
    loading: boolean;
    error: string | null;
  };
}

export function useCityProperties(cities: string[]): {
  cityPropertiesMap: CityPropertiesResult;
  allLoading: boolean;
  hasErrors: boolean;
} {
  const [cityPropertiesMap, setCityPropertiesMap] = useState<CityPropertiesResult>({});
  const [allLoading, setAllLoading] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (cities.length === 0) {
      setCityPropertiesMap({});
      setAllLoading(false);
      setHasErrors(false);
      return;
    }

    // Initialize loading state for all cities
    const initialMap: CityPropertiesResult = {};
    cities.forEach(city => {
      initialMap[city] = { properties: [], loading: true, error: null };
    });
    setCityPropertiesMap(initialMap);
    setAllLoading(true);
    setHasErrors(false);

    // Fetch properties for each city sequentially to avoid hook issues
    const fetchCityProperties = async () => {
      const promises = cities.map(async (city) => {
        try {
          // Use the properties API directly instead of the hook
          const { searchProperties } = await import('@core/api/services');
          const properties = await searchProperties({ city });
          return { city, properties, loading: false, error: null };
        } catch (error) {
          return { 
            city, 
            properties: [], 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to load properties' 
          };
        }
      });

      const results = await Promise.all(promises);
      
      const newMap: CityPropertiesResult = {};
      let hasAnyErrors = false;
      
      results.forEach(({ city, properties, loading, error }) => {
        newMap[city] = { properties, loading, error };
        if (error) hasAnyErrors = true;
      });

      setCityPropertiesMap(newMap);
      setAllLoading(false);
      setHasErrors(hasAnyErrors);
    };

    fetchCityProperties();
  }, [cities]);

  return {
    cityPropertiesMap,
    allLoading,
    hasErrors,
  };
}