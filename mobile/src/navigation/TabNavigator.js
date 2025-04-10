import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';

// Import screens
import JobOrdersScreen from '../screens/JobOrdersScreen';
import TasksScreen from '../screens/TasksScreen';
import MessengerScreen from '../screens/MessengerScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Custom tab bar icon with badge for messages
const TabBarIcon = ({ IconComponent, iconName, focused, badge }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.iconWrapper,
          focused ? [styles.activeIconWrapper, { backgroundColor: theme.colors.primary }] : {},
        ]}
      >
        <IconComponent
          name={iconName}
          size={22}
          color={focused ? '#FFFFFF' : theme.colors.textSecondary}
        />
      </View>
      {badge > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.colors.notification, borderColor: theme.colors.card },
          ]}
        >
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
};

const TabNavigator = () => {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Mock unread message count - replace with actual data from your API
  const unreadMessages = 3;

  // Calculate tab bar height based on device
  const tabBarHeight =
    Platform.OS === 'ios'
      ? insets.bottom > 0
        ? 70
        : 60 // iPhone with notch vs without
      : 60; // Android

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 0,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        safeAreaInsets: { bottom: 0 },
      }}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              IconComponent={MaterialIcons}
              iconName="dashboard"
              focused={focused}
              badge={0}
            />
          ),
          unmountOnBlur: false,
        }}
      />
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
            <TabBarIcon IconComponent={FontAwesome} iconName="user" focused={focused} badge={0} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TabNavigator;
