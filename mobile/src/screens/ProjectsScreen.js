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
  Animated,
} from 'react-native';
import { apiService } from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 30;

const ProjectsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [projectStats, setProjectStats] = useState({});
  const [overallStats, setOverallStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    inProgress: 0,
    jobOrders: 0,
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Fix the timing of animation
  useEffect(() => {
    // Reset opacity to 0 and then animate to 1
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [overallStats]); // Animate when stats change, not just when projects change

  // Load user data and projects when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ProjectsScreen focused');
      loadUserData();
      return () => {};
    }, [])
  );

  // Modify the useEffect for job order stats to handle edge cases
  useEffect(() => {
    if (user && projects.length > 0) {
      loadJobOrderStats(projects);
    } else {
      // Even with no projects, still set default stats
      calculateOverallStats(projects || []);
    }
  }, [user, projects]);

  // Add a useEffect to initialize the statistics when the component mounts
  useEffect(() => {
    // Calculate overall stats with empty projects array to ensure stats cards are shown
    calculateOverallStats([]);
  }, []); // Empty dependency array means this runs once on mount

  // Update the calculateOverallStats function to include a dedicated "pending" property
  const calculateOverallStats = projectsData => {
    console.log('Calculating overall stats with', projectsData?.length || 0, 'projects');

    if (!projectsData || projectsData.length === 0) {
      setOverallStats({
        total: 0,
        active: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        jobOrders: 0,
      });
      return;
    }

    const stats = {
      total: projectsData.length,
      active: projectsData.filter(
        p =>
          p.status &&
          (p.status.toUpperCase() === 'IN PROGRESS' || p.status.toUpperCase() === 'PENDING')
      ).length,
      completed: projectsData.filter(p => p.status && p.status.toUpperCase() === 'COMPLETED')
        .length,
      inProgress: projectsData.filter(p => p.status && p.status.toUpperCase() === 'IN PROGRESS')
        .length,
      pending: projectsData.filter(p => p.status && p.status.toUpperCase() === 'PENDING').length,
      jobOrders: 0,
    };

    // Calculate total job orders if projectStats is available
    if (projectStats && Object.keys(projectStats).length > 0) {
      Object.values(projectStats).forEach(projStat => {
        if (projStat && projStat.total) {
          stats.jobOrders += projStat.total;
        }
      });
    }

    console.log('Setting overall stats:', stats);
    setOverallStats(stats);
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      console.log('Loading user data...');
      const userData = await AsyncStorage.getItem('@fln_liaison_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User data loaded:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('No user data found in AsyncStorage');
      }

      // Load projects after user data is loaded
      await loadProjects();
    } catch (err) {
      console.error('Error loading user data:', err);
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setError(null);
      console.log('Attempting to fetch projects...');

      // Check if apiService.projects exists
      if (!apiService.projects) {
        console.error('apiService.projects is undefined');
        setError('API service not properly configured');
        setLoading(false);
        return;
      }

      const response = await apiService.projects.getAll();

      // Check if response exists and has data property
      if (response && response.data) {
        // Handle different response formats
        if (response.data.success || response.data.status === 'success') {
          const projectsData = response.data.data || [];
          console.log(`Found ${projectsData.length} projects`);

          // Initialize project data
          setProjects(projectsData);

          // Initialize stats directly with project data
          calculateOverallStats(projectsData);

          // If we have a user, load job order stats
          if (user && user.id) {
            loadJobOrderStats(projectsData);
          }
        } else {
          const errorMsg = response.data.message || 'Failed to load projects';
          console.error('API returned error:', errorMsg);
          setError(errorMsg);
        }
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(`Failed to load projects: ${err.message}`);

      // Fallback to empty projects array
      setProjects([]);
      calculateOverallStats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load job order stats for each project
  const loadJobOrderStats = async projectsData => {
    try {
      if (!user || !user.id) {
        console.warn('No user data available, skipping job order stats loading');
        return;
      }

      const liaisonId = user.id;
      console.log(
        `Loading job order stats for liaison ID: ${liaisonId} with ${projectsData.length} projects`
      );

      // Create an array of promises for fetching job orders for each project
      const fetchPromises = projectsData.map(async project => {
        const projectId = project.id || project.project_id;

        if (!projectId) return null;

        try {
          // Get assigned job orders for this project
          const response = await apiService.jobOrders.getAssignedByProjectAndLiaison(
            projectId,
            liaisonId
          );

          if (
            response &&
            response.data &&
            (response.data.success || response.data.status === 'success')
          ) {
            // Filter job orders for current liaison
            const jobOrders = response.data.data || [];

            // Count job orders by status
            const pending = jobOrders.filter(
              jo => jo.status && jo.status.toLowerCase().includes('pending')
            ).length;
            const completed = jobOrders.filter(
              jo => jo.status && jo.status.toLowerCase().includes('complete')
            ).length;
            const cancelled = jobOrders.filter(
              jo => jo.status && jo.status.toLowerCase().includes('cancel')
            ).length;
            const inProgress = jobOrders.filter(
              jo => jo.status && jo.status.toLowerCase().includes('progress')
            ).length;
            const submitted = jobOrders.filter(
              jo => jo.status && jo.status.toLowerCase().includes('submitted')
            ).length;

            return {
              projectId,
              stats: {
                total: jobOrders.length,
                pending,
                completed,
                cancelled,
                inProgress,
                submitted,
              },
            };
          }
        } catch (err) {
          console.error(
            `Error fetching assigned job orders for project ${projectId}:`,
            err.message
          );
        }

        // Return default stats if there was an error or no valid response
        return {
          projectId,
          stats: {
            total: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            inProgress: 0,
            submitted: 0,
          },
        };
      });

      // Wait for all fetch operations to complete
      const results = await Promise.all(fetchPromises);

      // Convert results array to an object keyed by projectId
      const stats = {};
      results.forEach(result => {
        if (result && result.projectId) {
          stats[result.projectId] = result.stats;
        }
      });

      console.log('All assigned job order stats loaded:', Object.keys(stats).length);
      setProjectStats(stats);

      // After loading project stats, update the overall stats
      setTimeout(() => calculateOverallStats(projectsData), 100);
    } catch (err) {
      console.error('Error loading assigned job order stats:', err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
    // Note: Job order stats will be loaded via useEffect when projects are updated
  };

  const handleProjectPress = project => {
    // Extract project ID - handle different property names
    const projectId = project.id || project.project_id;

    // Extract project name - handle different property names
    const projectName =
      project.service_name || project.project_name || project.name || 'Project Details';

    // Get liaison ID from user object - ensure it's a number if possible
    let liaisonId = null;
    if (user && user.id) {
      liaisonId = parseInt(user.id, 10) || user.id;
      console.log(`Using liaison ID: ${liaisonId} (${typeof liaisonId})`);
    } else {
      console.warn('No user ID found for liaison filtering');
    }

    console.log('Navigating to JobOrdersByProject with params:', {
      projectId: `${projectId} (${typeof projectId})`,
      projectName,
      liaisonId: `${liaisonId} (${typeof liaisonId})`,
    });

    // Ensure all IDs are properly converted to the expected format
    navigation.navigate('JobOrdersByProject', {
      projectId: projectId,
      projectName,
      liaisonId: liaisonId,
    });
  };

  const renderProjectStats = () => {
    // Always render the stats section, even if there are no projects
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Project Overview</Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.primary}20` }]}
              >
                <FontAwesome5 name="folder-open" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {overallStats.total}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Projects
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.warning}20` }]}
              >
                <FontAwesome5 name="pause-circle" size={18} color={theme.colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {overallStats.pending}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.success}20` }]}
              >
                <FontAwesome5 name="check-circle" size={18} color={theme.colors.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {overallStats.completed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Completed
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCardWide,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.secondary}20` }]}
              >
                <FontAwesome5 name="tasks" size={18} color={theme.colors.secondary} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {overallStats.jobOrders}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Job Orders
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statCardWide,
                {
                  backgroundColor: theme.colors.card,
                  shadowColor: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[styles.statIconCircle, { backgroundColor: `${theme.colors.primary}20` }]}
              >
                <FontAwesome5 name="user" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  #{user?.id || '-'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  User ID
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderProjectItem = ({ item }) => {
    if (!item) return null;

    // Get project ID
    const projectId = item.id || item.project_id;
    if (!projectId) return null;

    // Get stats for this project
    const stats = projectStats[projectId] || {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
      submitted: 0,
    };

    // Get project status
    const status = item.status || 'Unknown';
    const statusColor = getStatusColor(status, theme);

    // Calculate progress percentage
    let progressPercentage = 0;
    if (stats.total > 0) {
      progressPercentage = Math.round(((stats.completed + stats.submitted) / stats.total) * 100);
    }

    return (
      <TouchableOpacity
        style={[
          styles.projectItem,
          {
            backgroundColor: theme.colors.card,
            shadowColor: theme.isDarkMode ? '#000' : '#000',
            borderLeftColor: statusColor,
            borderTopColor: theme.colors.border,
            borderRightColor: theme.colors.border,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <Text style={[styles.projectTitle, { color: theme.colors.text }]}>
            {item.project_name || item.name || 'Unnamed Project'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.projectDetails}>
          <View style={styles.projectDetail}>
            <MaterialIcons name="business" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {item.client_name || item.client || 'N/A'}
            </Text>
          </View>

          <View style={styles.projectDetail}>
            <MaterialIcons name="event" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {formatDate(item.start_date)} - {formatDate(item.end_date)}
            </Text>
          </View>

          {stats.total > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelContainer}>
                <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                  Progress
                </Text>
                <Text style={[styles.progressPercentage, { color: theme.colors.textSecondary }]}>
                  {progressPercentage}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: `${theme.colors.border}50` }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: statusColor,
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Job Order Stats Badges */}
        <View style={styles.badgeContainer}>
          {stats.total > 0 ? (
            <>
              <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.countBadgeText}>
                  {stats.total} Task{stats.total !== 1 ? 's' : ''}
                </Text>
              </View>

              {stats.pending > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.warning }]}>
                  <Text style={styles.countBadgeText}>{stats.pending} Pending</Text>
                </View>
              )}

              {stats.inProgress > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.info }]}>
                  <Text style={styles.countBadgeText}>{stats.inProgress} In Progress</Text>
                </View>
              )}

              {stats.completed > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.success }]}>
                  <Text style={styles.countBadgeText}>{stats.completed} Completed</Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.countBadge, { backgroundColor: theme.colors.disabled }]}>
              <Text style={styles.countBadgeText}>No Job Orders</Text>
            </View>
          )}
        </View>

        <View style={styles.projectFooter}>
          <TouchableOpacity style={styles.viewButton} onPress={() => handleProjectPress(item)}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>
              View Job Orders
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status, theme) => {
    if (!status) return theme.colors.disabled;

    switch (status.toUpperCase()) {
      case 'IN PROGRESS':
        return theme.colors.info;
      case 'COMPLETED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'ON HOLD':
        return theme.colors.secondary;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.disabled;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper title="Projects">
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading projects...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title="Projects"
      showBackButton={false}
      backgroundColor={theme?.colors?.background || '#f5f5f5'}
    >
      {error ? (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme?.colors?.background || '#f5f5f5' },
          ]}
        >
          <Text style={[styles.errorText, { color: theme?.colors?.error || 'red' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme?.colors?.primary || '#842624' }]}
            onPress={loadProjects}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={item =>
            (item?.id || item?.project_id || Math.random().toString()).toString()
          }
          contentContainerStyle={[
            styles.listContainer,
            projects.length === 0 ? { flex: 1, justifyContent: 'center' } : null,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme?.colors?.primary || '#842624']}
              tintColor={theme?.colors?.primary || '#842624'}
            />
          }
          ListHeaderComponent={renderProjectStats}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: theme?.colors?.background || '#f5f5f5' },
              ]}
            >
              <MaterialIcons
                name="folder-off"
                size={70}
                color={theme?.colors?.disabled || '#cccccc'}
                style={{ marginBottom: 20 }}
              />
              <Text
                style={[styles.emptyText, { color: theme?.colors?.textSecondary || '#666666' }]}
              >
                No projects found
              </Text>
              <Text
                style={[styles.emptySubText, { color: theme?.colors?.textTertiary || '#999999' }]}
              >
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (CARD_WIDTH - 32) / 3,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
  },
  statCardWide: {
    width: (CARD_WIDTH - 20) / 2,
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 100, // Extra padding at the bottom for tab bar
  },
  projectItem: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectDetails: {
    marginBottom: 10,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    gap: 5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

export default ProjectsScreen;
