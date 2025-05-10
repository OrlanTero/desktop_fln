import axios from 'axios';
import { Platform } from 'react-native';

// API configuration
const API_CONFIG = {
  // Local development URL (for emulator/simulator)
  LOCAL_URL: 'http://localhost:4006',

  // Ngrok tunnel URL (for physical devices)
  // NGROK_URL: 'https://a39f-120-28-70-225.ngrok-free.app',

  // NGROK_URL: 'https://fln.enutrition.site',
  // NGROK_URL: 'https://d792-2001-4453-409-b600-cc6f-815c-8a13-1339.ngrok-free.app',
  NGROK_URL: 'http://192.168.1.5:4005',

  SERVER_ADDRESS: 'http://localhost:3001',
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
    Accept: 'application/json',
  },
});

// Add request interceptor to handle both HTTP and HTTPS
apiClient.interceptors.request.use(
  config => {
    // Get the current base URL
    const currentUrl = config.baseURL;

    // If the URL is the ngrok URL, ensure it uses HTTPS
    if (currentUrl.includes('ngrok-free.app') && !currentUrl.startsWith('https')) {
      config.baseURL = currentUrl.replace('http://', 'https://');
    }

    console.log(
      `API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data || ''
    );
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    console.log(
      `API Response [${response.status}] from ${response.config.url}:`,
      response.data
        ? Array.isArray(response.data)
          ? `Array with ${response.data.length} items`
          : response.data
        : 'No data'
    );
    return response;
  },
  error => {
    console.error('API Response Error:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Function to switch between local and ngrok URLs
export const switchApiUrl = (useNgrok = false) => {
  const newBaseUrl = useNgrok ? API_CONFIG.NGROK_URL : API_CONFIG.LOCAL_URL;
  apiClient.defaults.baseURL = newBaseUrl;
  apiClient.defaults.serverUrl = API_CONFIG.SERVER_ADDRESS;
  console.log(`API URL switched to: ${newBaseUrl}`);
};

export default apiClient;
