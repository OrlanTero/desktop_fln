import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const UserListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    if (!user || !user.id) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.users.getAll();
      
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Filter out current user from the list
        const otherUsers = response.data.data.filter(u => u.id !== user.id);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } else {
        // Use placeholder data for testing
        console.log('Using placeholder data for users');
        const placeholderUsers = [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            photo_url: 'https://randomuser.me/api/portraits/men/1.jpg',
            role: 'Client',
            is_online: true
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            photo_url: null,
            role: 'Manager',
            is_online: false
          },
          {
            id: 3,
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            photo_url: 'https://randomuser.me/api/portraits/men/3.jpg',
            role: 'Designer',
            is_online: true
          },
          {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            photo_url: null,
            role: 'Developer',
            is_online: false
          },
          {
            id: 5,
            name: 'David Wilson',
            email: 'david.wilson@example.com',
            photo_url: 'https://randomuser.me/api/portraits/men/5.jpg',
            role: 'Admin',
            is_online: false
          },
          {
            id: 6,
            name: 'Jennifer Taylor',
            email: 'jennifer.taylor@example.com',
            photo_url: 'https://randomuser.me/api/portraits/women/6.jpg',
            role: 'Designer',
            is_online: true
          },
          {
            id: 7,
            name: 'Robert Martinez',
            email: 'robert.martinez@example.com',
            photo_url: null,
            role: 'Developer',
            is_online: false
          },
          {
            id: 8,
            name: 'Lisa Anderson',
            email: 'lisa.anderson@example.com',
            photo_url: 'https://randomuser.me/api/portraits/women/8.jpg',
            role: 'Client',
            is_online: true
          }
        ];
        
        // Filter out current user from placeholder data
        const filteredPlaceholderUsers = placeholderUsers.filter(u => u.id !== user.id);
        setUsers(filteredPlaceholderUsers);
        setFilteredUsers(filteredPlaceholderUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      
      // Use placeholder data on error
      const placeholderUsers = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@example.com',
          photo_url: 'https://randomuser.me/api/portraits/men/1.jpg',
          role: 'Client',
          is_online: true
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          photo_url: null,
          role: 'Manager',
          is_online: false
        }
      ];
      
      // Filter out current user from placeholder data
      const filteredPlaceholderUsers = placeholderUsers.filter(u => u.id !== user.id);
      setUsers(filteredPlaceholderUsers);
      setFilteredUsers(filteredPlaceholderUsers);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (selectedUser) => {
    // Navigate to conversation with this user
    navigation.navigate('Conversation', {
      contact: {
        id: selectedUser.id,
        name: selectedUser.name,
        photo_url: selectedUser.photo_url,
        role: selectedUser.role,
        is_online: selectedUser.is_online
      }
    });
  };

  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}
      >
        <View style={styles.avatarContainer}>
          <UserAvatar 
            name={item.name}
            photoUrl={item.photo_url}
            size={50}
          />
          {item.is_online && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userRole}>{item.role || 'User'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No users found matching your search' : 'No users available'}
      </Text>
    </View>
  );

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
        
        {/* User List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchUsers}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
          />
        )}
      </View>
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
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  userItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CD964',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserListScreen; 