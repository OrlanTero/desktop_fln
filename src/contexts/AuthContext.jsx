import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      // Call the API to login
      const response = await window.api.user.login({ email, password });
      
      if (response.success) {
        // Store user in state and localStorage
        setCurrentUser(response.data);
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      // Call the API to register
      const response = await window.api.user.create(userData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update user profile
  const updateProfile = async (id, userData) => {
    setError(null);
    try {
      // Call the API to update user
      const response = await window.api.user.update(id, userData);
      
      if (response.success) {
        // Update current user if it's the same user
        if (currentUser && currentUser.id === id) {
          const updatedUser = { ...currentUser, ...userData };
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        return { success: true };
      } else {
        setError(response.message || 'Update failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during update';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update password
  const updatePassword = async (id, passwordData) => {
    setError(null);
    try {
      // Call the API to update password
      const response = await window.api.user.updatePassword(id, passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Password update failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during password update';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Value to be provided by the context
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 