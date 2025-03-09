import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { apiService } from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PauseCircleIcon from 'react-native-vector-icons/MaterialIcons';
import AssignmentIcon from 'react-native-vector-icons/MaterialIcons';
import CheckCircleIcon from 'react-native-vector-icons/MaterialIcons';
import CancelIcon from 'react-native-vector-icons/MaterialIcons';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Load user data and tasks
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@fln_liaison_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User data loaded:', parsedUser);
        setUser(parsedUser);
        // Load tasks for this user
        loadTasks(parsedUser.id);
      } else {
        console.log('No user data found in AsyncStorage');
        setError('User data not found. Please log in again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error loading user data: ' + err.message);
      setLoading(false);
    }
  };

  const loadTasks = async (liaisonId) => {
    try {
      setError(null);
      console.log(`Loading tasks for liaison ID: ${liaisonId}`);
      
      if (!liaisonId) {
        throw new Error('No liaison ID provided');
      }
      
      const response = await apiService.tasks.getByLiaison(liaisonId);
      console.log('Tasks API response:', JSON.stringify(response));
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        const tasksData = response.data.data || [];
        console.log(`Loaded ${tasksData.length} tasks for liaison ${liaisonId}`);
        console.log('Tasks data:', JSON.stringify(tasksData));
        
        // Check if the data is in the expected format
        if (tasksData.length > 0) {
          console.log('First task sample:', JSON.stringify(tasksData[0]));
        }
        
        // Normalize the data if needed
        const normalizedTasks = tasksData.map(task => ({
          id: task.id || task.task_id || Math.random().toString(),
          description: task.description || 'No description',
          service_name: task.service_name || '',
          service_category_name: task.service_category_name || '',
          status: task.status || 'PENDING',
          due_date: task.due_date || null
        }));
        
        console.log('Normalized tasks:', JSON.stringify(normalizedTasks));
        setTasks(normalizedTasks);
      } else {
        console.error('API response indicates failure:', response?.data?.message);
        throw new Error(response?.data?.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
      
      // If API is not yet connected, use placeholder data
      if (!apiService.tasks || err.message.includes('Network Error')) {
        console.log('Using placeholder data for tasks');
        setTasks([
          { id: 1, description: 'Design homepage mockup', service_name: 'Website Design', service_category_name: 'Web Development', status: 'IN_PROGRESS', due_date: '2023-07-10' },
          { id: 2, description: 'Implement user authentication', service_name: 'Web Application Development', service_category_name: 'Web Development', status: 'PENDING', due_date: '2023-07-15' },
          { id: 3, description: 'Create logo variations', service_name: 'Logo Design', service_category_name: 'Graphic Design', status: 'COMPLETED', due_date: '2023-07-12' },
          { id: 4, description: 'Optimize meta tags', service_name: 'SEO Optimization', service_category_name: 'Digital Marketing', status: 'PENDING', due_date: '2023-07-20' },
          { id: 5, description: 'Write blog articles', service_name: 'Content Writing', service_category_name: 'Content Creation', status: 'IN_PROGRESS', due_date: '2023-07-25' },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user && user.id) {
      loadTasks(user.id);
    } else {
      setRefreshing(false);
    }
  };

  const handleTaskPress = (task) => {
    navigation.navigate('TaskSubmission', { 
      taskId: task.id,
      taskTitle: task.description,
      currentStatus: task.status,
      serviceName: task.service_name || 'No Service'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'warning',
          icon: <MaterialIcons name="pause-circle" size={16} color="#ffc107" />
        };
      case 'IN_PROGRESS':
        return {
          color: 'info',
          icon: <MaterialIcons name="assignment" size={16} color="#007bff" />
        };
      case 'COMPLETED':
        return {
          color: 'success',
          icon: <MaterialIcons name="check-circle" size={16} color="#28a745" />
        };
      case 'CANCELLED':
        return {
          color: 'error',
          icon: <MaterialIcons name="cancel" size={16} color="#dc3545" />
        };
      case 'SUBMITTED':
        return {
          color: 'primary',
          icon: <MaterialIcons name="assignment-turned-in" size={16} color="#007bff" />
        };
      default:
        return {
          color: 'default',
          icon: null
        };
    }
  };

  const renderTaskItem = ({ item }) => {
    console.log('Rendering task item:', JSON.stringify(item));
    
    // Determine status style
    let statusStyle = styles.statusPending;
    let statusTextStyle = styles.statusTextPending;
    
    if (item.status === 'IN_PROGRESS') {
      statusStyle = styles.statusInProgress;
      statusTextStyle = styles.statusTextInProgress;
    } else if (item.status === 'COMPLETED') {
      statusStyle = styles.statusCompleted;
      statusTextStyle = styles.statusTextCompleted;
    } else if (item.status === 'CANCELLED') {
      statusStyle = styles.statusCancelled;
      statusTextStyle = styles.statusTextCancelled;
    } else if (item.status === 'SUBMITTED') {
      statusStyle = styles.statusSubmitted;
      statusTextStyle = styles.statusTextSubmitted;
    }

    // Format status text for display
    const statusText = item.status ? item.status.replace('_', ' ') : 'Unknown';

    return (
      <TouchableOpacity 
        style={styles.taskItem}
        onPress={() => handleTaskPress(item)}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.description || 'No description'}</Text>
        </View>
        
        {item.service_name && (
          <Text style={styles.serviceName}>Service: {item.service_name}</Text>
        )}
        
        {item.service_category_name && (
          <Text style={styles.categoryName}>Category: {item.service_category_name}</Text>
        )}
        
        <Text style={styles.dueDate}>Due: {formatDate(item.due_date)}</Text>
        
        <View style={styles.taskFooter}>
          <View style={statusStyle}>
            <Text style={statusTextStyle}>{statusText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Tasks">
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => user && user.id ? loadTasks(user.id) : loadUserData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Debug info */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>Tasks count: {tasks.length}</Text>
              <Text style={styles.debugText}>User ID: {user?.id || 'Not loaded'}</Text>
            </View>
          )}
          
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
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
                <Text style={styles.emptyText}>No tasks found</Text>
              </View>
            }
          />
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  listContainer: {
    padding: 15,
    paddingBottom: 120, // Extra padding at the bottom for tab bar
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusPending: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  statusTextPending: {
    color: '#6c757d',
    fontSize: 12,
  },
  statusInProgress: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#91d5ff',
  },
  statusTextInProgress: {
    color: '#1890ff',
    fontSize: 12,
  },
  statusCompleted: {
    backgroundColor: '#f6ffed',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#b7eb8f',
  },
  statusTextCompleted: {
    color: '#52c41a',
    fontSize: 12,
  },
  statusCancelled: {
    backgroundColor: '#fff1f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffa39e',
  },
  statusTextCancelled: {
    color: '#f5222d',
    fontSize: 12,
  },
  statusSubmitted: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffd591',
  },
  statusTextSubmitted: {
    color: '#ffa940',
    fontSize: 12,
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
    color: '#dc3545',
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
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f8d7da',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 4,
    display: __DEV__ ? 'flex' : 'none',
  },
  debugText: {
    color: '#721c24',
    fontSize: 12,
  },
});

export default TasksScreen; 