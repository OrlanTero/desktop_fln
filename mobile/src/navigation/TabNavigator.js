import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Import screens
import JobOrdersScreen from '../screens/JobOrdersScreen';
import TasksScreen from '../screens/TasksScreen';
import MessengerScreen from '../screens/MessengerScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Custom tab bar icon with badge for messages
const TabBarIcon = ({ IconComponent, iconName, focused, badge }) => (
  <View style={styles.iconContainer}>
    <View style={[
      styles.iconWrapper,
      focused ? styles.activeIconWrapper : {}
    ]}>
      <IconComponent 
        name={iconName} 
        size={22} 
        color={focused ? '#FFFFFF' : '#666'}
      />
    </View>
    {badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </View>
);

const TabNavigator = () => {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Mock unread message count - replace with actual data from your API
  const unreadMessages = 3;

  // Calculate tab bar height based on device
  const tabBarHeight = Platform.OS === 'ios' 
    ? (insets.bottom > 0 ? 70 : 60) // iPhone with notch vs without
    : 60; // Android

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 0,
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        safeAreaInsets: { bottom: 0 },
      }}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen 
        name="JobOrders" 
        component={JobOrdersScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              IconComponent={MaterialIcons} 
              iconName="assignment" 
              focused={focused}
              badge={0}
            />
          ),
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              IconComponent={MaterialIcons} 
              iconName="check-circle" 
              focused={focused}
              badge={0}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Messenger" 
        component={MessengerScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              IconComponent={MaterialIcons} 
              iconName="chat" 
              focused={focused}
              badge={unreadMessages}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Documents" 
        component={DocumentsScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              IconComponent={MaterialIcons} 
              iconName="folder" 
              focused={focused}
              badge={0}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              IconComponent={FontAwesome} 
              iconName="user" 
              focused={focused}
              badge={0}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginTop: 5,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#007BFF',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default TabNavigator; 