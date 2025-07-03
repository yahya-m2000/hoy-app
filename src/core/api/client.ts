/**
 * API Client
 * Clean axios instance with modular architecture
 */

import axios from "axios";
import { API_CONFIG } from '../config/api.config';

// ========================================
// AXIOS INSTANCE CONFIGURATION
// ========================================

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// ========================================
// EXPORTS
// ========================================

export default api;

// Named export for consistency
export { api };

// Re-export commonly used functions from other modules
export { 
  isTokenExpired, 
  getTokenExpirationTime,
  debugTokenRefreshFlow,
  clearAuthenticationData 
} from './auth-manager';

export { 
  checkConnection, 
  getNetworkInfo, 
  waitForConnection 
} from './network-utils';

export { 
  validateRequest, 
  classifyError, 
  API_CONFIG 
} from '../config/api.config';

