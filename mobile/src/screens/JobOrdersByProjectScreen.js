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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const JobOrdersByProjectScreen = ({ route, navigation }) => {
  // Extract and normalize parameters from route
  const params = route.params || {};
  const projectId = params.projectId ? params.projectId : null;
  const projectName = params.projectName || 'Job Orders';
  const liaisonId = params.liaisonId ? params.liaisonId : null;
  
  const [jobOrders, setJobOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Log parameters when component mounts
  useEffect(() => {
    console.log('JobOrdersByProjectScreen mounted with params:', {
      projectId: `${projectId} (${typeof projectId})`,
      projectName,
      liaisonId: `${liaisonId} (${typeof liaisonId})`,
      rawParams: JSON.stringify(params)
    });
    
    if (!projectId) {
      console.error('No project ID provided');
      setError('No project ID provided');
      setLoading(false);
      return;
    }
    
    // Load job orders when component mounts
    loadJobOrders();
  }, []);

  const loadJobOrders = async () => {
    try {
      setError(null);
      console.log(`Loading job orders for project ${projectId} and liaison ${liaisonId}`);
      
      // Check if apiService.jobOrders exists
      if (!apiService.jobOrders) {
        console.error('apiService.jobOrders is undefined');
        setError('API service not properly configured');
        setLoading(false);
        return;
      }
      
      // First, try to get all job orders for the project without filtering
      console.log(`Calling getByProject with projectId: ${projectId}`);
      const allJobOrdersResponse = await apiService.jobOrders.getByProject(projectId);
      console.log('All job orders response:', JSON.stringify(allJobOrdersResponse));
      
      if (allJobOrdersResponse && allJobOrdersResponse.data && 
          (allJobOrdersResponse.data.success || allJobOrdersResponse.data.status === 'success')) {
        
        const allJobOrders = allJobOrdersResponse.data.data || [];
        console.log(`Got ${allJobOrders.length} total job orders for project ${projectId}`);
        
        // Log all job orders to see what's available
        allJobOrders.forEach(order => {
          console.log(`Job order ${order.id || order.job_order_id}: liaison_id=${order.liaison_id}, status=${order.status}`);
        });
        
        // Now try to get assigned job orders
        try {
          console.log(`Calling getAssignedByProject with projectId: ${projectId}`);
          const assignedResponse = await apiService.jobOrders.getAssignedByProject(projectId);
          console.log('Assigned job orders response:', JSON.stringify(assignedResponse));
          
          if (assignedResponse && assignedResponse.data && 
              (assignedResponse.data.success || assignedResponse.data.status === 'success')) {
            
            const assignedOrders = assignedResponse.data.data || [];
            console.log(`Got ${assignedOrders.length} assigned job orders from API`);
            
            // Filter by liaison ID if needed
            if (liaisonId) {
              console.log(`Filtering assigned orders for liaison ${liaisonId}`);
              const filteredOrders = assignedOrders.filter(order => {
                const orderLiaisonId = order.liaison_id;
                const matches = orderLiaisonId == liaisonId;
                console.log(`Order ${order.id || order.job_order_id}: liaison_id=${orderLiaisonId}, matches=${matches}`);
                return matches;
              });
              
              console.log(`Found ${filteredOrders.length} orders assigned to liaison ${liaisonId}`);
              
              if (filteredOrders.length > 0) {
                setJobOrders(filteredOrders);
              } else {
                // If no assigned orders for this liaison, check if there are any assigned orders at all
                if (assignedOrders.length > 0) {
                  console.log('No job orders assigned to this liaison, but there are assigned orders for the project');
                  setJobOrders(assignedOrders); // Show all assigned orders for debugging
                } else {
                  console.log('No assigned job orders for this project, showing all job orders');
                  setJobOrders(allJobOrders); // Show all job orders for the project
                }
              }
            } else {
              console.log('No liaison ID provided, showing all assigned job orders');
              setJobOrders(assignedOrders);
            }
          } else {
            console.log('No success in assigned response, using all job orders');
            setJobOrders(allJobOrders);
          }
        } catch (assignedErr) {
          console.error('Error fetching assigned job orders:', assignedErr.message);
          console.log('Falling back to all job orders for the project');
          setJobOrders(allJobOrders);
        }
      } else {
        console.error('API response indicates failure:', allJobOrdersResponse?.data?.message);
        setError(allJobOrdersResponse?.data?.message || 'Failed to load job orders');
        setJobOrders([]);
      }
    } catch (err) {
      console.error('Error loading job orders:', err.message);
      setError(`Failed to load job orders: ${err.message}`);
      setJobOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobOrders();
  };

  const renderJobOrderItem = ({ item }) => {
    console.log('Rendering job order item:', JSON.stringify(item).substring(0, 200) + '...');
    
    // Extract the ID - handle different property names
    const id = item.job_order_id || item.id || 'unknown';
    
    // Determine status color
    let statusColor = '#999';
    const status = item.status || 'Unknown';
    
    if (status.toLowerCase().includes('progress')) statusColor = '#007BFF';
    if (status.toLowerCase().includes('complete')) statusColor = '#28a745';
    if (status.toLowerCase().includes('pending')) statusColor = '#ffc107';
    if (status.toLowerCase().includes('hold')) statusColor = '#ff9800';

    // Extract the description - handle different property names
    const description = item.description || item.title || item.name || 'No Description';

    console.log('[DEBUG]: JobOrderItem', JSON.stringify(item));
    
    // Extract the service name - handle different property names
    const serviceName = item.service_name || item.service || 'N/A';
    
    // Extract the fee - handle different property names and formats
    let fee = item.estimated_fee || item.fee || 0;
    let formattedFee;
    
    if (typeof fee === 'string') {
      // If it's already a string, try to clean it up
      formattedFee = fee.startsWith('$') ? fee : `$${fee}`;
    } else if (typeof fee === 'number') {
      // Format number as currency
      formattedFee = `$${fee.toFixed(2)}`;
    } else {
      // Fallback
      formattedFee = `$${parseFloat(fee || 0).toFixed(2)}`;
    }

    // Extract liaison information
    const liaisonName = item.liaison_name || 'Not assigned';
    const liaisonId = item.liaison_id || null;

    return (
      <TouchableOpacity 
        style={styles.jobOrderItem}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to job order submission screen
          navigation.navigate('JobOrderSubmission', { 
            jobOrderId: id,
            jobOrderTitle: description,
            currentStatus: status,
            serviceName: serviceName
          });
        }}
      >
        <View style={styles.jobOrderHeader}>
          <Text style={styles.jobOrderTitle}>{description}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.serviceName}>Service: {serviceName}</Text>
        <Text style={styles.fee}>Fee: {formattedFee}</Text>
        
        <Text style={styles.assignedTo}>
          Assigned to: {liaisonName}
          {liaisonId && ` (ID: ${liaisonId})`}
        </Text>
        
        {/* Submit button indicator */}
        <View style={styles.submitIndicator}>
          <MaterialIcons name="arrow-forward" size={16} color="#007BFF" />
          <Text style={styles.submitText}>Tap to submit</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper 
        title={projectName || 'Job Orders'} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading job orders...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper 
      title={projectName || 'Job Orders'} 
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadJobOrders}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobOrders}
          renderItem={renderJobOrderItem}
          keyExtractor={item => (item.job_order_id || item.id).toString()}
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
              <Text style={styles.emptyText}>No job orders assigned to you for this project</Text>
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
  jobOrderItem: {
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
  jobOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobOrderTitle: {
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
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fee: {
    fontSize: 14,
    color: '#666',
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
    textAlign: 'center',
  },
  assignedTo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  submitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#007BFF',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default JobOrdersByProjectScreen; 