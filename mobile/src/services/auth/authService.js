import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../api';

// Storage keys
const AUTH_TOKEN_KEY = '@fln_liaison_auth_token';
const USER_DATA_KEY = '@fln_liaison_user_data';

// Authentication service
const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiService.users.login({ email, password });
      
      if (response.data.status === 'success') {
        const user = response.data.user;
        // Generate a simple token if the API doesn't provide one
        // In a production app, you should use a proper token from the backend
        const token = response.data.token || `user_${user.id}_${Date.now()}`;
        
        // Check if user has liaison role
        if (!user.role || user.role !== 'liaison') {
          throw new Error('Access denied. Only liaison users can login to this app.');
        }
        
        // Store auth token and user data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        return {
          success: true,
          user,
          token
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if the error is from the API response
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.message || 'Login failed. Please try again.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      // Clear stored auth data
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false,
        error: error.message 
      };
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (!token || !userData) {
        return false;
      }
      
      // Verify the user is a liaison
      const user = JSON.parse(userData);
      return user.role === 'liaison';
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },
  
  // Get auth token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },
  
  // Update stored user data
  updateUserData: async (userData) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Update user data error:', error);
      return { 
        success: false,
        error: error.message 
      };
    }
  }
};

export default authService;