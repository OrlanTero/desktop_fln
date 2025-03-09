import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import UserAvatar from '../components/UserAvatar';

const ProfileEditScreen = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params?.activeTab || 'profile'); // 'profile' or 'password'
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || '');
      setPhotoUrl(user.photo_url || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to change your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setNewPhoto(selectedAsset);
        // Show local preview immediately
        setPhotoUrl(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    setSaving(true);
    try {
      let updatedPhotoUrl = photoUrl;
      
      // If there's a new photo, upload it first
      if (newPhoto) {
        const formData = new FormData();
        formData.append('profile_photo', {
          uri: newPhoto.uri,
          name: `profile_${user.id}_${Date.now()}.${newPhoto.uri.split('.').pop()}`,
          type: `image/${newPhoto.uri.split('.').pop()}`
        });
        
        const uploadResponse = await apiService.users.uploadPhoto(user.id, formData);
        
        if (uploadResponse.data && uploadResponse.data.status === 'success') {
          updatedPhotoUrl = uploadResponse.data.photo_url;
        } else {
          throw new Error('Failed to upload profile photo');
        }
      }
      
      // Update user profile
      const userData = {
        name,
        email,
        role,
        photo_url: updatedPhotoUrl
      };
      
      const response = await apiService.users.update(user.id, userData);
      
      if (response.data && response.data.status === 'success') {
        // Update local user state
        updateUser({
          ...user,
          ...userData
        });
        
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setSaving(true);
    try {
      const passwordData = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      };
      
      const response = await apiService.users.updatePassword(user.id, passwordData);
      
      if (response.data && response.data.status === 'success') {
        Alert.alert('Success', 'Password updated successfully');
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(response.data?.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={activeTab === 'profile' ? handleUpdateProfile : handleUpdatePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#007BFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'profile' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'profile' && styles.activeTabButtonText
            ]}>
              Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'password' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'password' && styles.activeTabButtonText
            ]}>
              Password
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {activeTab === 'profile' ? (
            <View style={styles.formContainer}>
              {/* Profile Photo */}
              <View style={styles.photoContainer}>
                <UserAvatar 
                  name={name}
                  photoUrl={photoUrl}
                  size={120}
                  style={styles.profilePhoto}
                />
                
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                >
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {/* Profile Form */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Role</Text>
                <TextInput
                  style={[styles.input, { color: '#666' }]}
                  value={role}
                  editable={false}
                />
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              {/* Password Form */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                />
                {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profilePhoto: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#007BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 5,
  },
});

export default ProfileEditScreen; 