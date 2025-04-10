import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { apiService } from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const JobOrdersByProjectScreen = ({ route, navigation }) => {
  const { theme } = useTheme();

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
      rawParams: JSON.stringify(params),
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

      if (
        allJobOrdersResponse &&
        allJobOrdersResponse.data &&
        (allJobOrdersResponse.data.success || allJobOrdersResponse.data.status === 'success')
      ) {
        const allJobOrders = allJobOrdersResponse.data.data || [];
        console.log(`Got ${allJobOrders.length} total job orders for project ${projectId}`);

        // Log all job orders to see what's available
        allJobOrders.forEach(order => {
          console.log(
            `Job order ${order.id || order.job_order_id}: liaison_id=${order.liaison_id}, status=${
              order.status
            }`
          );
        });

        // Now try to get assigned job orders
        try {
          console.log(`Calling getAssignedByProject with projectId: ${projectId}`);
          const assignedResponse = await apiService.jobOrders.getAssignedByProject(projectId);
          console.log('Assigned job orders response:', JSON.stringify(assignedResponse));

          if (
            assignedResponse &&
            assignedResponse.data &&
            (assignedResponse.data.success || assignedResponse.data.status === 'success')
          ) {
            const assignedOrders = assignedResponse.data.data || [];
            console.log(`Got ${assignedOrders.length} assigned job orders from API`);

            // Filter by liaison ID if needed
            if (liaisonId) {
              console.log(`Filtering assigned orders for liaison ${liaisonId}`);
              const filteredOrders = assignedOrders.filter(order => {
                const orderLiaisonId = order.liaison_id;
                const matches = orderLiaisonId == liaisonId;
                console.log(
                  `Order ${
                    order.id || order.job_order_id
                  }: liaison_id=${orderLiaisonId}, matches=${matches}`
                );
                return matches;
              });

              console.log(`Found ${filteredOrders.length} orders assigned to liaison ${liaisonId}`);

              if (filteredOrders.length > 0) {
                setJobOrders(filteredOrders);
              } else {
                // If no assigned orders for this liaison, check if there are any assigned orders at all
                if (assignedOrders.length > 0) {
                  console.log(
                    'No job orders assigned to this liaison, but there are assigned orders for the project'
                  );
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

  // Function to determine status color with theme
  const getStatusColor = status => {
    if (!status) return theme.colors.disabled;

    const statusLower = status.toLowerCase();
    if (statusLower.includes('progress')) return theme.colors.info;
    if (statusLower.includes('complete')) return theme.colors.success;
    if (statusLower.includes('pending')) return theme.colors.warning;
    if (statusLower.includes('hold')) return theme.colors.secondary;
    if (statusLower.includes('cancel')) return theme.colors.error;

    return theme.colors.disabled;
  };

  const renderJobOrderItem = ({ item }) => {
    console.log('Rendering job order item:', JSON.stringify(item).substring(0, 200) + '...');

    // Extract the ID - handle different property names
    const id = item.job_order_id || item.id || 'unknown';

    // Determine status color
    const status = item.status || 'Unknown';
    const statusColor = getStatusColor(status);

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
        style={[
          styles.jobOrderItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to job order submission screen
          navigation.navigate('JobOrderSubmission', {
            jobOrderId: id,
            jobOrderTitle: description,
            currentStatus: status,
            serviceName: serviceName,
          });
        }}
      >
        <View style={styles.jobOrderHeader}>
          <Text style={[styles.jobOrderId, { color: theme.colors.textSecondary }]}>#{id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={[styles.jobOrderTitle, { color: theme.colors.text }]}>{description}</Text>

        <View style={styles.detailsRow}>
          <Text style={[styles.serviceLabel, { color: theme.colors.textSecondary }]}>Service:</Text>
          <Text style={[styles.serviceValue, { color: theme.colors.text }]}>{serviceName}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={[styles.feeLabel, { color: theme.colors.textSecondary }]}>
            Estimated Fee:
          </Text>
          <Text style={[styles.feeValue, { color: theme.colors.text }]}>{formattedFee}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={[styles.assignedLabel, { color: theme.colors.textSecondary }]}>
            Assigned To:
          </Text>
          <Text style={[styles.assignedValue, { color: theme.colors.text }]}>{liaisonName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading job orders...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadJobOrders}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobOrders}
          renderItem={renderJobOrderItem}
          keyExtractor={item => item.job_order_id || item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No job orders found for this project
              </Text>
              <MaterialIcons
                name="assignment-off"
                size={50}
                color={theme.colors.disabled}
                style={{ marginTop: 20 }}
              />
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
    paddingBottom: 80,
  },
  jobOrderItem: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
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
  jobOrderId: {
    fontSize: 14,
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
  jobOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  serviceLabel: {
    width: 100,
    fontSize: 14,
  },
  serviceValue: {
    flex: 1,
    fontSize: 14,
  },
  feeLabel: {
    width: 100,
    fontSize: 14,
  },
  feeValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  assignedLabel: {
    width: 100,
    fontSize: 14,
  },
  assignedValue: {
    flex: 1,
    fontSize: 14,
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
    fontSize: 16,
    textAlign: 'center',
  },
});

export default JobOrdersByProjectScreen;
