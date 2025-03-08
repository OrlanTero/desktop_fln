import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth/authService';
import { apiClient } from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        const authStatus = await authService.isAuthenticated();
        setIsAuthenticated(authStatus);

        if (authStatus) {
          // Get user data and token
          const userData = await authService.getCurrentUser();
          const authToken = await authService.getToken();
          
          setUser(userData);
          setToken(authToken);
          
          // Set auth token in API client headers
          if (authToken) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        
        // Set auth token in API client headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      
      // Clear auth state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Remove auth token from API client headers
      delete apiClient.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      const result = await authService.updateUserData({
        ...user,
        ...userData
      });
      
      if (result.success) {
        setUser(prev => ({
          ...prev,
          ...userData
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // Auth context value
  const authContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 