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
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [projectStats, setProjectStats] = useState({});

  // Load user data and projects on component mount
  useEffect(() => {
    console.log('ProjectsScreen mounted');
    loadUserData();
    loadProjects();
  }, []);

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
    } catch (err) {
      console.error('Error loading user data:', err);
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
      console.log('Projects API response:', JSON.stringify(response));
      
      // Check if response exists and has data property
      if (response && response.data) {
        console.log('Response data:', JSON.stringify(response.data));
        
        // Handle different response formats
        if (response.data.success || response.data.status === 'success') {
          const projectsData = response.data.data || [];
          console.log(`Found ${projectsData.length} projects`);
          setProjects(projectsData);
          
          // Load job order stats for each project
          await loadJobOrderStats(projectsData);
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
      console.error('Error details:', err.message);
      if (err.response) {
        console.error('Error response:', JSON.stringify(err.response));
      }
      setError(`Failed to load projects: ${err.message}`);
      
      // Fallback to empty projects array
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load job order stats for each project
  const loadJobOrderStats = async (projectsData) => {
    try {
      console.log('Loading job order stats for all projects...');
      
      // Create an array of promises for fetching job orders for each project
      const fetchPromises = projectsData.map(async (project) => {
        const projectId = project.id || project.project_id;
        
        if (!projectId) return null;
        
        // Get liaison ID from user object
        const liaisonId = user?.id;

        if (!liaisonId) {
          console.warn('No liaison ID found, cannot load assigned job orders');
          return;
        }
        

        try {
          // Get assigned job orders for this project

          const response = await apiService.jobOrders.getAssignedByProjectAndLiaison(projectId, liaisonId);
          
          if (response && response.data && (response.data.success || response.data.status === 'success')) {
            // Filter job orders for current liaison
            const jobOrders = (response.data.data || []);
            
            // Count job orders by status
            const pending = jobOrders.filter(jo => 
              jo.status && jo.status.toLowerCase().includes('pending')).length;
            const completed = jobOrders.filter(jo => 
              jo.status && jo.status.toLowerCase().includes('complete')).length;
            const cancelled = jobOrders.filter(jo => 
              jo.status && jo.status.toLowerCase().includes('cancel')).length;
            const inProgress = jobOrders.filter(jo => 
              jo.status && jo.status.toLowerCase().includes('progress')).length;
            const submitted = jobOrders.filter(jo => 
              jo.status && jo.status.toLowerCase().includes('submitted')).length;
            
            return {
              projectId,
              stats: {
                total: jobOrders.length,
                pending,
                completed,
                cancelled,
                inProgress,
                submitted
              }
            };
          }
        } catch (err) {
          console.error(`Error fetching assigned job orders for project ${projectId}:`, err.message);
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
            submitted: 0
          }
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
    } catch (err) {
      console.error('Error loading assigned job order stats:', err.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleProjectPress = (project) => {
    // Extract project ID - handle different property names
    const projectId = project.id || project.project_id;
    
    // Extract project name - handle different property names
    const projectName = project.service_name || project.project_name || project.name || 'Project Details';
    
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
      project: JSON.stringify(project).substring(0, 100) + '...',
      user: user ? JSON.stringify(user).substring(0, 100) + '...' : 'null'
    });
    
    // Ensure all IDs are properly converted to the expected format
    navigation.navigate('JobOrdersByProject', { 
      projectId: projectId,
      projectName,
      liaisonId: liaisonId
    });
  };

  const renderProjectItem = ({ item }) => {
    // Get project ID
    const projectId = item.id || item.project_id;
    
    // Get stats for this project
    const stats = projectStats[projectId] || { 
      total: 0, pending: 0, completed: 0, cancelled: 0, inProgress: 0, submitted: 0 
    };
    
    return (
      <TouchableOpacity 
        style={styles.projectItem}
        onPress={() => handleProjectPress(item)}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.project_name || item.name || 'Unnamed Project'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
          </View>
        </View>
        
        <Text style={styles.clientName}>Client: {item.client_name || item.client || 'N/A'}</Text>
        <Text style={styles.date}>Start Date: {formatDate(item.start_date)}</Text>
        <Text style={styles.date}>End Date: {formatDate(item.end_date)}</Text>
        
        {/* Job Order Stats Badges */}
        <View style={styles.badgeContainer}>
          {stats.pending > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#ffc107' }]}>
              <Text style={styles.countBadgeText}>{stats.pending} Pending</Text>
            </View>
          )}
          
          {stats.inProgress > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#264888' }]}>
              <Text style={styles.countBadgeText}>{stats.inProgress} In Progress</Text>
            </View>
          )}
          
          {stats.completed > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#28a745' }]}>
              <Text style={styles.countBadgeText}>{stats.completed} Completed</Text>
            </View>
          )}
          
          {stats.cancelled > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#dc3545' }]}>
              <Text style={styles.countBadgeText}>{stats.cancelled} Cancelled</Text>
            </View>
          )}
          
          {stats.submitted > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#9c27b0' }]}>
              <Text style={styles.countBadgeText}>{stats.submitted} Submitted</Text>
            </View>
          )}
          
          {stats.total === 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#6c757d' }]}>
              <Text style={styles.countBadgeText}>No Job Orders</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status) => {
    if (!status) return '#999';
    
    switch(status.toUpperCase()) {
      case 'IN PROGRESS':
        return '#264888';
      case 'COMPLETED':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'ON HOLD':
        return '#ff9800';
      case 'CANCELLED':
        return '#dc3545';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper title="Projects">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper 
      title="Projects"
      showBackButton={false}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadProjects}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={item => (item.id || item.project_id).toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#842624']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No projects found</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 15,
    paddingBottom: 120, // Extra padding at the bottom for tab bar
  },
  projectItem: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  clientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
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
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProjectsScreen; 