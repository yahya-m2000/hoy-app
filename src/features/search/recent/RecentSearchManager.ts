import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RecentSearch {
  id: string;
  location: string;
  displayDates: string;
  startDate?: string;
  endDate?: string;
  adults: number;
  children: number;
  rooms: number;
  displayTravelers: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

const RECENT_SEARCHES_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 5;

export class RecentSearchManager {
  static async getRecentSearches(): Promise<RecentSearch[]> {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];

      const searches: RecentSearch[] = JSON.parse(stored);
      // Sort by timestamp, most recent first
      return searches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error loading recent searches:", error);
      return [];
    }
  }

  static async addRecentSearch(
    searchData: Omit<RecentSearch, "id" | "timestamp">
  ): Promise<void> {
    try {
      const existing = await this.getRecentSearches();

      // Check if this search already exists (same location and dates)
      const duplicate = existing.find(
        (search) =>
          search.location === searchData.location &&
          search.displayDates === searchData.displayDates &&
          search.adults === searchData.adults &&
          search.rooms === searchData.rooms
      );

      let updatedSearches: RecentSearch[];

      if (duplicate) {
        // Remove duplicate and add updated version at the top
        updatedSearches = existing.filter(
          (search) => search.id !== duplicate.id
        );
      } else {
        updatedSearches = existing;
      }

      // Add new search at the beginning
      const newSearch: RecentSearch = {
        ...searchData,
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      updatedSearches.unshift(newSearch);

      // Keep only the most recent searches
      updatedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedSearches)
      );
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  }

  static async removeRecentSearch(id: string): Promise<void> {
    try {
      const existing = await this.getRecentSearches();
      const filtered = existing.filter((search) => search.id !== id);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  }

  static async clearAllRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  }
}
