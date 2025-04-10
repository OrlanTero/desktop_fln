import React from 'react';
import { StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Enable screens for better performance
enableScreens();

// Main app container that uses theme
const AppContainer = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.colors.statusBar}
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
