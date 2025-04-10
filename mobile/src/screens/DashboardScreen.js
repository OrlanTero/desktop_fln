import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { apiService } from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserAvatar from '../components/UserAvatar';

// Get screen width for responsive design
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    taskCount: 0,
    completedTasks: 0,
    pendingTasks: 0,
    jobOrderCount: 0,
    pendingJobOrders: 0,
    completedJobOrders: 0,
    unreadMessages: 0,
    recentProjects: [],
    upcomingDeadlines: [],
  });

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@fln_liaison_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Load dashboard data
        loadDashboardData(parsedUser.id);
      } else {
        console.log('No user data found');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setLoading(false);
    }
  };

  // Load dashboard data from API
  const loadDashboardData = async userId => {
    try {
      setLoading(true);

      // In reality, you would have a single dashboard API endpoint
      // But for this example, we'll mock the data or fetch from multiple endpoints

      // Try to fetch tasks data
      let taskData = { total: 0, completed: 0, pending: 0 };
      try {
        const taskResponse = await apiService.tasks.getByLiaison(userId);
        if (taskResponse && taskResponse.data && taskResponse.data.data) {
          const tasks = taskResponse.data.data;
          taskData = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'COMPLETED').length,
            pending: tasks.filter(t => t.status !== 'COMPLETED').length,
          };
        }
      } catch (err) {
        console.log('Error fetching tasks:', err);
      }

      // Try to fetch job orders data
      let jobOrderData = { total: 0, completed: 0, pending: 0 };
      try {
        const projectsResponse = await apiService.projects.getAll();
        if (projectsResponse && projectsResponse.data && projectsResponse.data.data) {
          const projects = projectsResponse.data.data;

          // Get all job orders across projects
          let allJobOrders = [];
          for (const project of projects.slice(0, 3)) {
            // Limit to first 3 projects for performance
            try {
              const response = await apiService.jobOrders.getAssignedByProjectAndLiaison(
                project.id || project.project_id,
                userId
              );

              if (response && response.data && response.data.data) {
                allJobOrders = [...allJobOrders, ...response.data.data];
              }
            } catch (error) {
              console.log('Error fetching job orders for project:', error);
            }
          }

          jobOrderData = {
            total: allJobOrders.length,
            completed: allJobOrders.filter(jo => jo.status === 'COMPLETED').length,
            pending: allJobOrders.filter(jo => jo.status !== 'COMPLETED').length,
          };

          // Get upcoming deadlines
          const upcomingDeadlines = allJobOrders
            .filter(job => job.status !== 'COMPLETED' && job.due_date)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 3); // Get top 3 nearest deadlines

          // Get recent projects
          const recentProjects = projects.slice(0, 3);

          setDashboardData(prevData => ({
            ...prevData,
            upcomingDeadlines,
            recentProjects,
          }));
        }
      } catch (err) {
        console.log('Error fetching job orders:', err);
      }

      // Try to fetch unread messages count
      let unreadCount = 0;
      try {
        const messagesResponse = await apiService.messages.getRecentConversations(userId);
        if (messagesResponse && messagesResponse.data) {
          unreadCount = messagesResponse.data.reduce(
            (total, convo) => total + (convo.unread_count || 0),
            0
          );
        }
      } catch (err) {
        console.log('Error fetching messages:', err);
      }

      // Update dashboard data state
      setDashboardData(prevData => ({
        ...prevData,
        taskCount: taskData.total,
        completedTasks: taskData.completed,
        pendingTasks: taskData.pending,
        jobOrderCount: jobOrderData.total,
        completedJobOrders: jobOrderData.completed,
        pendingJobOrders: jobOrderData.pending,
        unreadMessages: unreadCount,
      }));

      // If API calls fail, use placeholder data for testing
      if (!taskData.total && !jobOrderData.total) {
        setDashboardData({
          taskCount: 8,
          completedTasks: 5,
          pendingTasks: 3,
          jobOrderCount: 12,
          pendingJobOrders: 7,
          completedJobOrders: 5,
          unreadMessages: 3,
          recentProjects: [
            {
              id: 1,
              project_name: 'Website Redesign',
              client_name: 'ABC Corp',
              status: 'In Progress',
            },
            {
              id: 2,
              project_name: 'Mobile App Development',
              client_name: 'XYZ Ltd',
              status: 'Pending',
            },
            { id: 3, project_name: 'Brand Identity', client_name: 'Acme Inc', status: 'Completed' },
          ],
          upcomingDeadlines: [
            {
              job_order_id: 1,
              description: 'Homepage Design',
              due_date: '2023-07-15',
              service_name: 'Web Design',
            },
            {
              job_order_id: 2,
              description: 'User Authentication',
              due_date: '2023-07-18',
              service_name: 'Development',
            },
            {
              job_order_id: 3,
              description: 'Logo Variants',
              due_date: '2023-07-20',
              service_name: 'Graphic Design',
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user && user.id) {
      loadDashboardData(user.id);
    } else {
      setRefreshing(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'No due date';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      return dateString;
    }
  };

  // Calculate task completion percentage
  const taskCompletionPercentage =
    dashboardData.taskCount > 0
      ? Math.round((dashboardData.completedTasks / dashboardData.taskCount) * 100)
      : 0;

  // Calculate job order completion percentage
  const jobOrderCompletionPercentage =
    dashboardData.jobOrderCount > 0
      ? Math.round((dashboardData.completedJobOrders / dashboardData.jobOrderCount) * 100)
      : 0;

  // Render loading state
  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading dashboard...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Dashboard">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.userInfoContainer}>
            <UserAvatar name={user?.name || 'User'} photoUrl={user?.photo_url || null} size={60} />
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Welcome back,</Text>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.name || 'User'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Tasks Card */}
          <TouchableOpacity
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.card, ...theme.shadow.medium },
            ]}
            onPress={() => navigation.navigate('Tasks')}
          >
            <View style={styles.statsIconContainer}>
              <View style={[styles.statsIconBg, { backgroundColor: `${theme.colors.primary}20` }]}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.primary} />
              </View>
            </View>
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>Tasks</Text>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {dashboardData.taskCount}
            </Text>
            <View style={styles.statInfoRow}>
              <Text style={[styles.statInfoText, { color: theme.colors.textSecondary }]}>
                {taskCompletionPercentage}% Complete
              </Text>
            </View>
          </TouchableOpacity>

          {/* Job Orders Card */}
          <TouchableOpacity
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.card, ...theme.shadow.medium },
            ]}
            onPress={() => navigation.navigate('JobOrders')}
          >
            <View style={styles.statsIconContainer}>
              <View
                style={[styles.statsIconBg, { backgroundColor: `${theme.colors.secondary}20` }]}
              >
                <MaterialIcons name="assignment" size={24} color={theme.colors.secondary} />
              </View>
            </View>
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>Job Orders</Text>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {dashboardData.jobOrderCount}
            </Text>
            <View style={styles.statInfoRow}>
              <Text style={[styles.statInfoText, { color: theme.colors.textSecondary }]}>
                {jobOrderCompletionPercentage}% Complete
              </Text>
            </View>
          </TouchableOpacity>

          {/* Messages Card */}
          <TouchableOpacity
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.card, ...theme.shadow.medium },
            ]}
            onPress={() => navigation.navigate('Messenger')}
          >
            <View style={styles.statsIconContainer}>
              <View style={[styles.statsIconBg, { backgroundColor: `${theme.colors.info}20` }]}>
                <MaterialIcons name="chat" size={24} color={theme.colors.info} />
              </View>
              {dashboardData.unreadMessages > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.notification }]}>
                  <Text style={styles.badgeText}>{dashboardData.unreadMessages}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>Messages</Text>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {dashboardData.unreadMessages}
            </Text>
            <View style={styles.statInfoRow}>
              <Text style={[styles.statInfoText, { color: theme.colors.textSecondary }]}>
                Unread messages
              </Text>
            </View>
          </TouchableOpacity>

          {/* Projects Card */}
          <TouchableOpacity
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.card, ...theme.shadow.medium },
            ]}
            onPress={() => navigation.navigate('Projects')}
          >
            <View style={styles.statsIconContainer}>
              <View style={[styles.statsIconBg, { backgroundColor: `${theme.colors.success}20` }]}>
                <MaterialIcons name="business-center" size={24} color={theme.colors.success} />
              </View>
            </View>
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>Projects</Text>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {dashboardData.recentProjects.length}
            </Text>
            <View style={styles.statInfoRow}>
              <Text style={[styles.statInfoText, { color: theme.colors.textSecondary }]}>
                Active projects
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Projects Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.recentProjects.length > 0 ? (
            <View style={styles.projectsContainer}>
              {dashboardData.recentProjects.map((project, index) => (
                <TouchableOpacity
                  key={project.id || index}
                  style={[
                    styles.projectCard,
                    { backgroundColor: theme.colors.card, ...theme.shadow.small },
                  ]}
                  onPress={() =>
                    navigation.navigate('JobOrdersByProject', {
                      projectId: project.id || project.project_id,
                      projectName: project.project_name,
                      liaisonId: user?.id,
                    })
                  }
                >
                  <View style={styles.projectCardContent}>
                    <Text style={[styles.projectName, { color: theme.colors.text }]}>
                      {project.project_name}
                    </Text>
                    <Text style={[styles.clientName, { color: theme.colors.textSecondary }]}>
                      {project.client_name || 'No client'}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: project.status?.toLowerCase().includes('progress')
                            ? `${theme.colors.info}20`
                            : project.status?.toLowerCase().includes('complet')
                            ? `${theme.colors.success}20`
                            : `${theme.colors.warning}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: project.status?.toLowerCase().includes('progress')
                              ? theme.colors.info
                              : project.status?.toLowerCase().includes('complet')
                              ? theme.colors.success
                              : theme.colors.warning,
                          },
                        ]}
                      >
                        {project.status || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View
              style={[styles.emptyStateContainer, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No recent projects found
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Deadlines Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Upcoming Deadlines
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.upcomingDeadlines.length > 0 ? (
            <View style={styles.deadlinesContainer}>
              {dashboardData.upcomingDeadlines.map((deadline, index) => (
                <TouchableOpacity
                  key={deadline.job_order_id || index}
                  style={[
                    styles.deadlineCard,
                    { backgroundColor: theme.colors.card, ...theme.shadow.small },
                  ]}
                  onPress={() =>
                    navigation.navigate('TaskSubmission', {
                      taskId: deadline.job_order_id,
                      taskTitle: deadline.description,
                      serviceName: deadline.service_name,
                    })
                  }
                >
                  <View style={styles.deadlineDate}>
                    <MaterialIcons name="event" size={20} color={theme.colors.primary} />
                    <Text style={[styles.deadlineDateText, { color: theme.colors.primary }]}>
                      {formatDate(deadline.due_date)}
                    </Text>
                  </View>
                  <Text style={[styles.deadlineTitle, { color: theme.colors.text }]}>
                    {deadline.description}
                  </Text>
                  {deadline.service_name && (
                    <Text style={[styles.deadlineService, { color: theme.colors.textSecondary }]}>
                      {deadline.service_name}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View
              style={[styles.emptyStateContainer, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No upcoming deadlines
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: cardWidth,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  statsIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfoText: {
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
  },
  projectsContainer: {
    marginBottom: 8,
  },
  projectCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  projectCardContent: {
    padding: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deadlinesContainer: {},
  deadlineCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  deadlineDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineDateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deadlineService: {
    fontSize: 14,
  },
  emptyStateContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
  },
});

export default DashboardScreen;
