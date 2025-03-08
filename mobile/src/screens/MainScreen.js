import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const MainScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [proposalCount, setProposalCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  // Load dashboard data
  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      // Fetch clients
      const clientsResponse = await apiService.clients.getAll();
      if (clientsResponse.data.status === 'success') {
        setClientCount(clientsResponse.data.data.length);
      }

      // Fetch proposals (if you have this endpoint)
      try {
        const proposalsResponse = await apiService.proposals.getAll();
        if (proposalsResponse.data.status === 'success') {
          setProposalCount(proposalsResponse.data.data.length);
        }
      } catch (error) {
        console.log('No proposals endpoint available');
      }

      // Fetch projects (if you have this endpoint)
      try {
        const projectsResponse = await apiService.projects.getAll();
        if (projectsResponse.data.status === 'success' || projectsResponse.data.success) {
          setProjectCount(projectsResponse.data.data.length);
        }
      } catch (error) {
        console.log('No projects endpoint available');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        Alert.alert('Logout Failed', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error.message || 'An unexpected error occurred');
    }
  };

  // Handle refresh
  const onRefresh = () => {
    loadDashboardData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/logo.jpg')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>FLN Liaison</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'Liaison'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007BFF']}
          />
        }
      >
        <Text style={styles.sectionTitle}>Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clientCount}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{proposalCount}</Text>
            <Text style={styles.statLabel}>Proposals</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projectCount}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to clients screen when implemented
              Alert.alert('Coming Soon', 'This feature is coming soon!');
            }}
          >
            <Text style={styles.actionButtonText}>View Clients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to proposals screen when implemented
              Alert.alert('Coming Soon', 'This feature is coming soon!');
            }}
          >
            <Text style={styles.actionButtonText}>View Proposals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to projects screen when implemented
              Alert.alert('Coming Soon', 'This feature is coming soon!');
            }}
          >
            <Text style={styles.actionButtonText}>View Projects</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MainScreen; 