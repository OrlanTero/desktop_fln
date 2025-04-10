import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { apiService } from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 30;

const TasksScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const fadeAnim = new Animated.Value(0);

  // Animate the stats cards when they appear
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [tasks]);

  // Load user data and tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      return () => {};
    }, [])
  );

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

  const loadTasks = async liaisonId => {
    try {
      setError(null);
      console.log(`Loading tasks for liaison ID: ${liaisonId}`);

      if (!liaisonId) {
        throw new Error('No liaison ID provided');
      }

      const response = await apiService.tasks.getByLiaison(liaisonId);
      console.log('Tasks API response:', JSON.stringify(response));

      if (
        response &&
        response.data &&
        (response.data.success || response.data.status === 'success')
      ) {
        const tasksData = response.data.data || [];
        console.log(`Loaded ${tasksData.length} tasks for liaison ${liaisonId}`);

        // Normalize the data if needed
        const normalizedTasks = tasksData.map(task => ({
          id: task.id || task.task_id || Math.random().toString(),
          description: task.description || 'No description',
          service_name: task.service_name || '',
          service_category_name: task.service_category_name || '',
          status: task.status || 'PENDING',
          due_date: task.due_date || null,
        }));

        setTasks(normalizedTasks);
        calculateTaskStats(normalizedTasks);
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
        const placeholderTasks = [
          {
            id: 1,
            description: 'Design homepage mockup',
            service_name: 'Website Design',
            service_category_name: 'Web Development',
            status: 'IN_PROGRESS',
            due_date: '2023-07-10',
          },
          {
            id: 2,
            description: 'Implement user authentication',
            service_name: 'Web Application Development',
            service_category_name: 'Web Development',
            status: 'PENDING',
            due_date: '2023-07-15',
          },
          {
            id: 3,
            description: 'Create logo variations',
            service_name: 'Logo Design',
            service_category_name: 'Graphic Design',
            status: 'COMPLETED',
            due_date: '2023-07-12',
          },
          {
            id: 4,
            description: 'Optimize meta tags',
            service_name: 'SEO Optimization',
            service_category_name: 'Digital Marketing',
            status: 'PENDING',
            due_date: '2023-07-20',
          },
          {
            id: 5,
            description: 'Write blog articles',
            service_name: 'Content Writing',
            service_category_name: 'Content Creation',
            status: 'IN_PROGRESS',
            due_date: '2023-07-25',
          },
        ];

        setTasks(placeholderTasks);
        calculateTaskStats(placeholderTasks);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTaskStats = taskList => {
    const today = new Date();

    const stats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'PENDING').length,
      inProgress: taskList.filter(t => t.status === 'IN_PROGRESS').length,
      completed: taskList.filter(t => t.status === 'COMPLETED' || t.status === 'SUBMITTED').length,
      overdue: taskList.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today && t.status !== 'COMPLETED' && t.status !== 'SUBMITTED';
      }).length,
    };

    setStats(stats);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user && user.id) {
      loadTasks(user.id);
    } else {
      setRefreshing(false);
    }
  };

  const handleTaskPress = task => {
    navigation.navigate('TaskSubmission', {
      taskId: task.id,
      taskTitle: task.description,
      currentStatus: task.status,
      serviceName: task.service_name || 'No Service',
    });
  };

  const formatDate = dateString => {
    if (!dateString) return 'No due date';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if due date is today or tomorrow
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      return dateString;
    }
  };

  const isOverdue = dateString => {
    if (!dateString) return false;
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      return dueDate < today;
    } catch (err) {
      return false;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'PENDING':
        return {
          color: theme.colors.warning,
          bgColor: `${theme.colors.warning}15`,
          borderColor: `${theme.colors.warning}50`,
          icon: <MaterialIcons name="pause-circle" size={16} color={theme.colors.warning} />,
        };
      case 'IN_PROGRESS':
        return {
          color: theme.colors.info,
          bgColor: `${theme.colors.info}15`,
          borderColor: `${theme.colors.info}50`,
          icon: <MaterialIcons name="assignment" size={16} color={theme.colors.info} />,
        };
      case 'COMPLETED':
        return {
          color: theme.colors.success,
          bgColor: `${theme.colors.success}15`,
          borderColor: `${theme.colors.success}50`,
          icon: <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />,
        };
      case 'CANCELLED':
        return {
          color: theme.colors.error,
          bgColor: `${theme.colors.error}15`,
          borderColor: `${theme.colors.error}50`,
          icon: <MaterialIcons name="cancel" size={16} color={theme.colors.error} />,
        };
      case 'SUBMITTED':
        return {
          color: theme.colors.primary,
          bgColor: `${theme.colors.primary}15`,
          borderColor: `${theme.colors.primary}50`,
          icon: (
            <MaterialIcons name="assignment-turned-in" size={16} color={theme.colors.primary} />
          ),
        };
      default:
        return {
          color: theme.colors.disabled,
          bgColor: `${theme.colors.disabled}15`,
          borderColor: `${theme.colors.disabled}50`,
          icon: null,
        };
    }
  };

  const renderTaskStats = () => {
    if (tasks.length === 0) return null;

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Task Overview</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.primary}20` }]}
              >
                <FontAwesome5 name="tasks" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View style={[styles.statIconCircle, { backgroundColor: `${theme.colors.info}20` }]}>
                <FontAwesome5 name="hourglass-half" size={18} color={theme.colors.info} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats.inProgress}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                In Progress
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.warning}20` }]}
              >
                <FontAwesome5 name="pause-circle" size={18} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.success}20` }]}
              >
                <FontAwesome5 name="check-circle" size={18} color={theme.colors.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Completed
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View style={[styles.statIconCircle, { backgroundColor: `${theme.colors.error}20` }]}>
                <FontAwesome5 name="exclamation-circle" size={18} color={theme.colors.error} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.overdue}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Overdue</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.text },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.primary}20` }]}
              >
                <FontAwesome5 name="user" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                #{user?.id || '-'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>User ID</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderTaskItem = ({ item }) => {
    // Get status style information
    const statusInfo = getStatusColor(item.status);

    // Format status text for display
    const statusText = item.status ? item.status.replace('_', ' ') : 'Unknown';

    // Check if the task is overdue
    const overdueStatus =
      isOverdue(item.due_date) && item.status !== 'COMPLETED' && item.status !== 'SUBMITTED';

    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          {
            backgroundColor: theme.colors.card,
            borderLeftColor: statusInfo.color,
            borderTopColor: theme.colors.border,
            borderRightColor: theme.colors.border,
            borderBottomColor: theme.colors.border,
            shadowColor: theme.colors.text,
          },
        ]}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
            {item.description || 'No description'}
          </Text>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.taskDetail}>
            <MaterialIcons name="category" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {item.service_name || 'No service'}
            </Text>
          </View>

          <View style={styles.taskDetail}>
            <MaterialIcons name="folder" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {item.service_category_name || 'No category'}
            </Text>
          </View>

          <View style={styles.taskDetail}>
            <MaterialIcons
              name="event"
              size={16}
              color={overdueStatus ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.detailText,
                {
                  color: overdueStatus ? theme.colors.error : theme.colors.textSecondary,
                  fontWeight: overdueStatus ? 'bold' : 'normal',
                },
              ]}
            >
              {formatDate(item.due_date)}
              {overdueStatus && ' (Overdue)'}
            </Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View
            style={{
              backgroundColor: statusInfo.bgColor,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: statusInfo.borderColor,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {statusInfo.icon && <View style={{ marginRight: 5 }}>{statusInfo.icon}</View>}
            <Text style={{ color: statusInfo.color, fontSize: 12, fontWeight: '600' }}>
              {statusText}
            </Text>
          </View>

          <TouchableOpacity style={styles.viewButton} onPress={() => handleTaskPress(item)}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>
              View Details
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper title="Tasks">
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading tasks...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Tasks" backgroundColor={theme.colors.background}>
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => (user && user.id ? loadTasks(user.id) : loadUserData())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={renderTaskStats}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
              <MaterialIcons
                name="assignment-off"
                size={70}
                color={theme.colors.disabled}
                style={{ marginBottom: 20 }}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No tasks found
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textTertiary }]}>
                Pull down to refresh
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    padding: 15,
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    width: (CARD_WIDTH - 30) / 3,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100, // Extra padding at the bottom for tab bar
  },
  taskItem: {
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    flex: 1,
    marginRight: 10,
  },
  taskDetails: {
    marginBottom: 10,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default TasksScreen;
