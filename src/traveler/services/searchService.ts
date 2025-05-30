import api from "@common/services/api";

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
  const response = await api.get<{ data: any[] }>("/search/nearby", {
    params: coords,
  });
  return response.data.data;
};

export const getTrendingSearches = async (): Promise<any> => {
  const response = await api.get<{ data: any }>("/search/trending");
  return response.data.data;
};
