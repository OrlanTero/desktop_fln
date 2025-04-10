import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define light and dark theme colors
const lightTheme = {
  colors: {
    primary: '#842624',
    secondary: '#264888',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    notification: '#FF3B30',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    disabled: '#9E9E9E',
    ripple: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    surface: '#F5F5F5',
    surfaceVariant: '#EEEEEE',
    inputBackground: '#F5F5F5',
    statusBar: 'dark-content',
    tabBar: '#FFFFFF',
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
    },
  },
};

const darkTheme = {
  colors: {
    primary: '#B05654', // Lighter shade for better contrast on dark
    secondary: '#5670B8', // Lighter shade for better contrast on dark
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    notification: '#FF453A',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    disabled: '#757575',
    ripple: 'rgba(255, 255, 255, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    inputBackground: '#2C2C2C',
    statusBar: 'light-content',
    tabBar: '#1E1E1E',
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
  },
};

// Create the ThemeContext
const ThemeContext = createContext();

// Create the ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@fln_liaison_theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If no saved preference, use device default
          setIsDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, [colorScheme]);

  // Toggle dark mode
  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('@fln_liaison_theme', newValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  // Get current theme
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleDarkMode,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
