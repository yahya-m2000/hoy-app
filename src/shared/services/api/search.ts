import api from "../core/client";

export interface SearchFilters {
  [key: string]: any;
}

export const searchPropertiesAdvanced = async (
  filters: SearchFilters
): Promise<any[]> => {
  const response = await api.get<{ data: any[] }>("/search", {
    params: filters,
  });
  return response.data.data;
};

export const getLocationSuggestions = async (query: string): Promise<any[]> => {
  const response = await api.get<{ data: any[] }>("/search/suggestions", {
    params: { query },
  });
  return response.data.data;
};

export const getNearbySearch = async (coords: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<any[]> => {
  // Disabled coordinate-based search to avoid geospatial query issues
  console.log("Nearby search disabled - coordinates ignored:", coords);
  return [];
};

export const getTrendingSearches = async (): Promise<any> => {
  const response = await api.get<{ data: any }>("/search/trending");
  return response.data.data;
};
