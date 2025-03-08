import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      setError(null);
      // Replace with your actual API endpoint for tasks
      // const response = await apiService.tasks.getAll();
      // if (response.data.status === 'success') {
      //   setTasks(response.data.data);
      // }
      
      // Placeholder data until API is connected
      setTasks([
        { id: 1, title: 'Design homepage mockup', project: 'Website Development', priority: 'High', dueDate: '2023-07-10', status: 'In Progress' },
        { id: 2, title: 'Implement user authentication', project: 'Mobile App Development', priority: 'Medium', dueDate: '2023-07-15', status: 'Pending' },
        { id: 3, title: 'Create logo variations', project: 'Logo Design', priority: 'High', dueDate: '2023-07-12', status: 'Completed' },
        { id: 4, title: 'Optimize meta tags', project: 'SEO Optimization', priority: 'Low', dueDate: '2023-07-20', status: 'Pending' },
        { id: 5, title: 'Write blog articles', project: 'Content Writing', priority: 'Medium', dueDate: '2023-07-25', status: 'In Progress' },
      ]);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const renderTaskItem = ({ item }) => {
    // Determine priority color
    let priorityColor = '#999';
    if (item.priority === 'High') priorityColor = '#dc3545';
    if (item.priority === 'Medium') priorityColor = '#ffc107';
    if (item.priority === 'Low') priorityColor = '#28a745';

    // Determine status style
    let statusStyle = styles.statusPending;
    let statusTextStyle = styles.statusTextPending;
    
    if (item.status === 'In Progress') {
      statusStyle = styles.statusInProgress;
      statusTextStyle = styles.statusTextInProgress;
    } else if (item.status === 'Completed') {
      statusStyle = styles.statusCompleted;
      statusTextStyle = styles.statusTextCompleted;
    }

    return (
      <TouchableOpacity 
        style={styles.taskItem}
        onPress={() => {
          // Navigate to task details when implemented
          // navigation.navigate('TaskDetails', { taskId: item.id });
        }}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        
        <Text style={styles.projectName}>Project: {item.project}</Text>
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
        
        <View style={styles.taskFooter}>
          <View style={statusStyle}>
            <Text style={statusTextStyle}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaWrapper edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadTasks}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id.toString()}
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
      )}
    </SafeAreaWrapper>
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectName: {
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
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TasksScreen; 