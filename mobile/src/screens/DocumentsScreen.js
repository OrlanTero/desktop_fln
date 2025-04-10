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
} from 'react-native';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDocuments = async () => {
    try {
      setError(null);
      // Replace with your actual API endpoint for documents
      // const response = await apiService.documents.getAll();
      // if (response.data.status === 'success') {
      //   setDocuments(response.data.data);
      // }

      // Placeholder data until API is connected
      setDocuments([
        {
          id: 1,
          name: 'Project Proposal - ABC Company.pdf',
          type: 'pdf',
          size: '2.4 MB',
          lastModified: '2023-07-05',
          project: 'Website Development',
        },
        {
          id: 2,
          name: 'Contract Agreement.docx',
          type: 'docx',
          size: '1.8 MB',
          lastModified: '2023-07-03',
          project: 'Logo Design',
        },
        {
          id: 3,
          name: 'UI Mockups.sketch',
          type: 'sketch',
          size: '5.2 MB',
          lastModified: '2023-06-28',
          project: 'Mobile App Development',
        },
        {
          id: 4,
          name: 'SEO Report - June 2023.xlsx',
          type: 'xlsx',
          size: '1.1 MB',
          lastModified: '2023-06-30',
          project: 'SEO Optimization',
        },
        {
          id: 5,
          name: 'Content Calendar.xlsx',
          type: 'xlsx',
          size: '0.9 MB',
          lastModified: '2023-07-01',
          project: 'Content Writing',
        },
      ]);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const filteredDocuments = documents.filter(
    document =>
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocumentIcon = type => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'pptx':
      case 'ppt':
        return '📑';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'sketch':
      case 'psd':
        return '🎨';
      default:
        return '📁';
    }
  };

  const renderDocumentItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.documentItem}
        onPress={() => {
          // Navigate to document details or preview when implemented
          // navigation.navigate('DocumentDetails', { documentId: item.id });
        }}
      >
        <View style={styles.documentIcon}>
          <Text style={styles.iconText}>{getDocumentIcon(item.type)}</Text>
        </View>

        <View style={styles.documentContent}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.documentInfo}>
            {item.size} • Last modified: {item.lastModified}
          </Text>
          <Text style={styles.projectName}>Project: {item.project}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaWrapper edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDocuments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocumentItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007BFF']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No documents found matching your search' : 'No documents available'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => {
          // Navigate to document upload screen when implemented
          // navigation.navigate('UploadDocument');
        }}
      >
        <Text style={styles.uploadButtonText}>+</Text>
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
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 120, // Extra padding at the bottom for tab bar
  },
  documentItem: {
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
  documentIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  projectName: {
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
  uploadButton: {
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
  uploadButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default DocumentsScreen;
