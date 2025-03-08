import axios from 'axios';
import { Platform } from 'react-native';

// API configuration
const API_CONFIG = {
  // Local development URL (for emulator/simulator)
  LOCAL_URL: 'http://localhost:4005',
  
  // Ngrok tunnel URL (for physical devices)
  NGROK_URL: 'https://01c4-120-28-70-225.ngrok-free.app',
};

// Determine the base URL based on the platform and environment
const getBaseUrl = () => {
  // For physical devices, use the ngrok URL
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return API_CONFIG.NGROK_URL;
  }
  
  // For development in emulator/simulator, use localhost
  return API_CONFIG.LOCAL_URL;
};

// Create axios instance with dynamic base URL
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to handle both HTTP and HTTPS
apiClient.interceptors.request.use(
  (config) => {
    // Get the current base URL
    const currentUrl = config.baseURL;
    
    // If the URL is the ngrok URL, ensure it uses HTTPS
    if (currentUrl.includes('ngrok-free.app') && !currentUrl.startsWith('https')) {
      config.baseURL = currentUrl.replace('http://', 'https://');
    }
    
    console.log(`[DEBUG API REQUEST] ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('[DEBUG API REQUEST ERROR]', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[DEBUG API RESPONSE] ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[DEBUG API RESPONSE ERROR]', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Function to switch between local and ngrok URLs
export const switchApiUrl = (useNgrok = false) => {
  const newBaseUrl = useNgrok ? API_CONFIG.NGROK_URL : API_CONFIG.LOCAL_URL;
  apiClient.defaults.baseURL = newBaseUrl;
  console.log(`API URL switched to: ${newBaseUrl}`);
};

export default apiClient; 