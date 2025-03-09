import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';

const MessengerScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const loadConversations = async () => {
    if (!user || !user.id) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    
    try {
      setError(null);
      const response = await apiService.messages.getRecentConversations(user.id);
      
      if (response.success && response.data && response.data.length > 0) {
        setConversations(response.data);
        
        // Count total unread messages
        const totalUnread = response.data.reduce((total, convo) => total + (convo.unread_count || 0), 0);
        setUnreadCount(totalUnread);
      } else {
        // Use placeholder data for testing if API returns empty or fails
        console.log('Using placeholder data for conversations');
        const placeholderData = [
          { 
            user_id: 1, 
            name: 'John Smith', 
            photo_url: 'https://randomuser.me/api/portraits/men/1.jpg', 
            role: 'Client',
            last_message: 'Can you send me the latest design files?', 
            last_message_time: new Date().toISOString(),
            unread_count: 2,
            is_online: true
          },
          { 
            user_id: 2, 
            name: 'Sarah Johnson', 
            photo_url: null, // No photo example
            role: 'Manager',
            last_message: 'The client approved the proposal!', 
            last_message_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
            unread_count: 0,
            is_online: false
          },
          { 
            user_id: 3, 
            name: 'Michael Brown', 
            photo_url: 'https://randomuser.me/api/portraits/men/3.jpg', 
            role: 'Designer',
            last_message: 'When can we schedule the next meeting?', 
            last_message_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
            unread_count: 1,
            is_online: true
          },
          { 
            user_id: 4, 
            name: 'Emily Davis', 
            photo_url: null, // No photo example
            role: 'Developer',
            last_message: 'I\'ve updated the project timeline.', 
            last_message_time: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            unread_count: 0,
            is_online: false
          },
          { 
            user_id: 5, 
            name: 'David Wilson', 
            photo_url: 'https://randomuser.me/api/portraits/men/5.jpg', 
            role: 'Admin',
            last_message: 'Please review the contract before sending it.', 
            last_message_time: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
            unread_count: 0,
            is_online: false
          },
        ];
        setConversations(placeholderData);
        setUnreadCount(3); // Sum of unread counts in placeholder data
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
      
      // Use placeholder data on error
      const placeholderData = [
        { 
          user_id: 1, 
          name: 'John Smith', 
          photo_url: 'https://randomuser.me/api/portraits/men/1.jpg', 
          role: 'Client',
          last_message: 'Can you send me the latest design files?', 
          last_message_time: new Date().toISOString(),
          unread_count: 2,
          is_online: true
        },
        { 
          user_id: 2, 
          name: 'Sarah Johnson', 
          photo_url: 'https://randomuser.me/api/portraits/women/2.jpg', 
          role: 'Manager',
          last_message: 'The client approved the proposal!', 
          last_message_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
          unread_count: 0,
          is_online: false
        },
      ];
      setConversations(placeholderData);
      setUnreadCount(2);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      loadConversations();
      
      // Set up polling for new messages
      const interval = setInterval(() => {
        if (!refreshing && user && user.id) {
          loadConversations();
        }
      }, 10000); // Poll every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for focus events to refresh data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user && user.id) {
        loadConversations();
      }
    });
    
    return unsubscribe;
  }, [navigation, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week - show day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[messageDate.getDay()];
    } else {
      // Older - show date
      return messageDate.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => {
          navigation.navigate('Conversation', { 
            contact: {
              id: item.user_id,
              name: item.name,
              photo_url: item.photo_url,
              role: item.role,
              is_online: item.is_online
            }
          });
        }}
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
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{item.name}</Text>
            <Text style={styles.timestamp}>{formatLastMessageTime(item.last_message_time)}</Text>
          </View>
          
          <Text 
            style={[
              styles.lastMessage, 
              item.unread_count > 0 ? styles.unreadMessage : {}
            ]}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaWrapper edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadConversations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.user_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007BFF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No conversations found matching your search' : 'No conversations yet'}
              </Text>
              <TouchableOpacity
                style={styles.startConversationButton}
                onPress={() => navigation.navigate('UserList')}
              >
                <Text style={styles.startConversationButtonText}>Start a new conversation</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.newMessageButton}
        onPress={() => navigation.navigate('UserList')}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingBottom: 120,
  },
  conversationItem: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  centerContainer: {
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
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  startConversationButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  startConversationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newMessageButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default MessengerScreen; 