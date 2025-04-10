import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import UserAvatar from '../components/UserAvatar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    // Load notification settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifSetting = await AsyncStorage.getItem('@fln_liaison_notifications');
      if (notifSetting !== null) {
        setNotificationsEnabled(notifSetting === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // Navigation will be handled by the AuthContext
    } catch (error) {
      Alert.alert('Logout Failed', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('@fln_liaison_notifications', newValue.toString());
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const navigateToEditProfile = () => {
    navigation.navigate('ProfileEdit', { activeTab: 'profile' });
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ProfileEdit', { activeTab: 'password' });
  };

  const navigateToHelp = () => {
    // Navigate to help screen when implemented
    Alert.alert('Coming Soon', 'Help and support feature is coming soon!');
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
        </View>

        <View style={[styles.profileSection, { backgroundColor: theme.colors.card }]}>
          <UserAvatar
            name={user?.name || 'Liaison User'}
            photoUrl={user?.avatar || user?.photo_url || null}
            size={100}
          />
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {user?.name || 'Liaison User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <Text style={[styles.profileRole, { color: theme.colors.textSecondary }]}>
            Role: {user?.role || 'Liaison'}
          </Text>

          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: `${theme.colors.primary}15` }]}
            onPress={navigateToEditProfile}
          >
            <Text style={[styles.editProfileButtonText, { color: theme.colors.primary }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Settings</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={navigateToChangePassword}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="vpn-key"
                size={22}
                color={theme.colors.primary}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Change Password
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="notifications"
                size={22}
                color={theme.colors.info}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
              thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.disabled}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name={isDarkMode ? 'brightness-7' : 'brightness-2'}
                size={22}
                color={isDarkMode ? theme.colors.warning : theme.colors.secondary}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
              thumbColor={isDarkMode ? theme.colors.primary : theme.colors.disabled}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={navigateToHelp}
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="help-outline"
                size={22}
                color={theme.colors.info}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Help & Support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() =>
              Alert.alert(
                'About FLN Liaison',
                `Version ${appVersion}\n\nFLN Liaison App is designed to help freelancers manage job orders, tasks, and client communications efficiently.`
              )
            }
          >
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="info-outline"
                size={22}
                color={theme.colors.secondary}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>About</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.logoutButtonContent}>
              <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Version {appVersion}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    marginBottom: 15,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 5,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
  },
});

export default ProfileScreen;
