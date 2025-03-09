import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
// Import TabNavigator
import TabNavigator from './TabNavigator';
import ProjectsScreen from '../screens/ProjectsScreen';
import JobOrdersByProjectScreen from '../screens/JobOrdersByProjectScreen';
import JobOrderSubmissionScreen from '../screens/JobOrderSubmissionScreen';
import TaskSubmissionScreen from '../screens/TaskSubmissionScreen';

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
    <AppStack.Screen 
      name="Projects" 
      component={ProjectsScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <AppStack.Screen 
      name="JobOrdersByProject" 
      component={JobOrdersByProjectScreen}
      options={({ route }) => ({ 
        title: route.params?.projectName || 'Job Orders',
        headerShown: true
      })}
    />
    <AppStack.Screen 
      name="JobOrderSubmission" 
      component={JobOrderSubmissionScreen}
      options={({ route }) => ({ 
        title: 'Submit Job Order',
        headerShown: true
      })}
    />
    <AppStack.Screen 
      name="TaskSubmission" 
      component={TaskSubmissionScreen}
      options={({ route }) => ({ 
        title: 'Submit Task',
        headerShown: true
      })}
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
          primary: '#007BFF',
          background: '#FFFFFF',
          card: '#FFFFFF',
          text: '#333333',
          border: '#E0E0E0',
          notification: '#FF3B30',
        },
        dark: false,
        fonts: {
          regular: {
            fontFamily: undefined,
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: undefined,
            fontWeight: '500',
          },
          light: {
            fontFamily: undefined,
            fontWeight: '300',
          },
          thin: {
            fontFamily: undefined,
            fontWeight: '100',
          },
        },
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation; 