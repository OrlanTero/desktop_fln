import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
// Import TabNavigator
import TabNavigator from './TabNavigator';

// Create stacks
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();
const RootStack = createStackNavigator();

// Auth navigator (when user is not logged in)
const AuthNavigator = () => (
  <AuthStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{
        animationEnabled: false,
      }}
    />
  </AuthStack.Navigator>
);

// App navigator (when user is logged in)
const AppNavigator = () => (
  <AppStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <AppStack.Screen 
      name="Main" 
      component={TabNavigator} 
      options={{
        animationEnabled: false,
      }}
    />
    {/* Add more screens here as needed */}
  </AppStack.Navigator>
);

// Root navigator that switches between Auth and App navigators
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show splash screen while checking authentication
  if (isLoading) {
    return (
      <RootStack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <RootStack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{
            animationEnabled: false,
          }}
        />
      </RootStack.Navigator>
    );
  }

  return (
    <RootStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      {isAuthenticated ? (
        <RootStack.Screen 
          name="App" 
          component={AppNavigator} 
          options={{
            animationEnabled: false,
          }}
        />
      ) : (
        <RootStack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{
            animationEnabled: false,
          }}
        />
      )}
    </RootStack.Navigator>
  );
};

// Main navigation container
const Navigation = () => {
  return (
    <NavigationContainer
      theme={{
        colors: {
          background: 'transparent',
          card: '#FFFFFF',
          text: '#333333',
          border: '#E0E0E0',
          notification: '#FF3B30',
          primary: '#007BFF',
        },
        dark: false,
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation; 