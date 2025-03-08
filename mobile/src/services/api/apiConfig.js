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
  timeout: 10000,
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
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
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