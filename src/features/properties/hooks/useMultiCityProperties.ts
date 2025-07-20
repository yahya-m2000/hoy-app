import { useProperties } from "./useProperties";

export function useMultiCityProperties(cities: string[]) {
  return cities.map(city => ({
    city,
    ...useProperties({ city }),
  }));
} 