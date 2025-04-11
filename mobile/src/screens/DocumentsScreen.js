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
  Modal,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useTheme } from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DocumentsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'folder', 'file', 'menu'
  const [newFolderName, setNewFolderName] = useState('');

  const loadDocumentsAndFolders = async () => {
    try {
      setError(null);

      // Load folders and documents for the current folder
      const folderId = currentFolder ? currentFolder.folder_id : null;

      // API call to get folders
      const foldersResponse = await apiService.folders.getByParent(folderId);
      if (foldersResponse && foldersResponse.data && foldersResponse.data.status === 'success') {
        setFolders(foldersResponse.data.data);
      } else {
        // Temporary placeholder data for folders
        setFolders([
          {
            folder_id: 101,
            name: 'Project Documents',
            parent_folder_id: folderId,
            created_at: '2023-07-01',
          },
          {
            folder_id: 102,
            name: 'Client Files',
            parent_folder_id: folderId,
            created_at: '2023-07-02',
          },
        ]);
      }

      // API call to get documents
      const documentsResponse = await apiService.documents.getByFolder(folderId);
      if (
        documentsResponse &&
        documentsResponse.data &&
        documentsResponse.data.status === 'success'
      ) {
        setDocuments(documentsResponse.data.data);
      } else {
        // Placeholder data
      setDocuments([
        {
            document_id: 1,
            file_name: 'Project Proposal - ABC Company.pdf',
            file_type: 'pdf',
            file_path: '/documents/proposal1.pdf',
            media_type: 'document',
            created_at: '2023-07-05',
          size: '2.4 MB',
          },
          {
            document_id: 2,
            file_name: 'Contract Agreement.docx',
            file_type: 'docx',
            file_path: '/documents/contract1.docx',
            media_type: 'document',
            created_at: '2023-07-03',
          size: '1.8 MB',
          },
          {
            document_id: 3,
            file_name: 'UI Mockups.png',
            file_type: 'png',
            file_path: '/documents/mockup.png',
            media_type: 'image',
            created_at: '2023-06-28',
          size: '5.2 MB',
        },
      ]);
      }
    } catch (err) {
      console.error('Error loading documents and folders:', err);
      setError('Failed to load documents and folders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocumentsAndFolders();
  }, [currentFolder]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDocumentsAndFolders();
  };

  const navigateBack = () => {
    if (folderPath.length > 0) {
      // Pop the last folder from the path
      const newPath = [...folderPath];
      newPath.pop();

      // Set current folder to the parent folder or null if at root
      const parentFolder = newPath.length > 0 ? newPath[newPath.length - 1] : null;
      setCurrentFolder(parentFolder);
      setFolderPath(newPath);
    }
  };

  const navigateToFolder = folder => {
    setFolderPath([...folderPath, folder]);
    setCurrentFolder(folder);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      // API call to create a folder
      const parentId = currentFolder ? currentFolder.folder_id : null;
      const response = await apiService.folders.create({
        name: newFolderName,
        parent_folder_id: parentId,
      });

      if (response && response.data && response.data.status === 'success') {
        // Add the new folder to the list
        setFolders([...folders, response.data.data]);
      } else {
        // For development/testing, add a mock folder
        const mockFolder = {
          folder_id: Math.floor(Math.random() * 1000) + 200,
          name: newFolderName,
          parent_folder_id: parentId,
          created_at: new Date().toISOString().split('T')[0],
        };
        setFolders([...folders, mockFolder]);
      }

      // Close modal and reset form
      setModalVisible(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
      Alert.alert('Error', 'Failed to create folder. Please try again.');
    }
  };

  const handleUploadFile = async (isImage = false) => {
    try {
      let result;

      if (isImage) {
        // Request camera roll permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
          return;
        }

        // Pick image
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
          base64: true,
        });
      } else {
        // Pick document
        result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
        });
      }

      if (!result.canceled && (result.assets?.[0] || result.uri)) {
        // Handle the file
        const asset = result.assets?.[0] || result;
        const fileUri = asset.uri;
        const fileName = asset.name || fileUri.split('/').pop();
        const fileType = asset.mimeType?.split('/').pop() || fileName.split('.').pop();

        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        const fileSize = fileInfo.size;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Prepare file data for API
        const fileData = {
          name: fileName,
          type: fileType,
          base64: `data:${asset.mimeType || `application/${fileType}`};base64,${base64}`,
          size: fileSize,
        };

        // API call to save the file
        const folderId = currentFolder ? currentFolder.folder_id : null;
        const response = await apiService.documents.upload(fileData, folderId);

        if (response && response.data && response.data.status === 'success') {
          // Add the new document to the list
          setDocuments([...documents, response.data.data]);
        } else {
          // For development/testing, add a mock document
          const mockDocument = {
            document_id: Math.floor(Math.random() * 1000) + 200,
            file_name: fileName,
            file_type: fileType,
            file_path: `/documents/${fileName}`,
            media_type: isImage ? 'image' : 'document',
            created_at: new Date().toISOString().split('T')[0],
            size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
          };
          setDocuments([...documents, mockDocument]);
        }

        Alert.alert('Success', `${isImage ? 'Image' : 'File'} uploaded successfully`);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      Alert.alert('Error', `Failed to upload ${isImage ? 'image' : 'file'}. Please try again.`);
    } finally {
      setModalVisible(false);
    }
  };

  const openActionMenu = () => {
    setModalType('menu');
    setModalVisible(true);
  };

  const filteredItems = [...folders, ...documents].filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    const name = item.name || item.file_name || '';
    return name.toLowerCase().includes(searchTerm);
  });

  const getDocumentIcon = (type, mediaType) => {
    if (mediaType === 'image') return '🖼️';

    switch ((type || '').toLowerCase()) {
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
      case 'gif':
        return '🖼️';
      case 'sketch':
      case 'psd':
        return '🎨';
      default:
        return '📁';
    }
  };

  const renderItem = ({ item }) => {
    const isFolder = 'folder_id' in item;

    if (isFolder) {
      return (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.colors.card }]}
          onPress={() => navigateToFolder(item)}
        >
          <View style={styles.itemIcon}>
            <MaterialIcons name="folder" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.itemInfo, { color: theme.colors.textSecondary }]}>
              Folder • Created: {item.created_at}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      );
    } else {
      // It's a document
      const isImage =
        item.media_type === 'image' ||
        ['jpg', 'jpeg', 'png', 'gif'].includes((item.file_type || '').toLowerCase());

    return (
      <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.colors.card }]}
        onPress={() => {
            // Handle document preview
            Alert.alert('Document Preview', 'Document preview functionality coming soon!');
        }}
      >
          <View style={styles.itemIcon}>
            <Text style={styles.iconText}>{getDocumentIcon(item.file_type, item.media_type)}</Text>
        </View>
          <View style={styles.itemContent}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.file_name}
          </Text>
            <Text style={[styles.itemInfo, { color: theme.colors.textSecondary }]}>
              {item.size || '0 KB'} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaWrapper edges={['top']}>
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading documents...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={['top']} backgroundColor={theme.colors.background}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        ]}
      >
        {currentFolder ? (
          <View style={styles.headerWithBackButton}>
            <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {currentFolder.name}
            </Text>
          </View>
        ) : (
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Documents</Text>
        )}
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          placeholder="Search documents and folders..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadDocumentsAndFolders}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => (item.folder_id || item.document_id).toString()}
          contentContainerStyle={[
            styles.listContainer,
            { backgroundColor: theme.colors.background },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="folder-open" size={50} color={theme.colors.disabled} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery ? 'No items found matching your search' : 'This folder is empty'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={openActionMenu}
      >
        <MaterialIcons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Action Menu Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            {modalType === 'menu' && (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create New</Text>

                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                  onPress={() => {
                    setModalType('folder');
                    setNewFolderName('');
                  }}
                >
                  <MaterialIcons name="create-new-folder" size={24} color={theme.colors.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                    New Folder
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleUploadFile(false)}
                >
                  <MaterialIcons name="upload-file" size={24} color={theme.colors.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                    Upload Document
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalOption} onPress={() => handleUploadFile(true)}>
                  <MaterialIcons name="image" size={24} color={theme.colors.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                    Upload Image
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'folder' && (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Create New Folder
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Enter folder name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  autoFocus
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={handleCreateFolder}
                  >
                    <Text style={[styles.buttonText, { color: '#FFF' }]}>Create</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    borderBottomWidth: 1,
  },
  headerWithBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 120, // Extra padding at the bottom for tab bar
    minHeight: '100%',
  },
  item: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
      },
      android: {
    elevation: 2,
      },
    }),
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemInfo: {
    fontSize: 12,
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
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
      android: {
        elevation: 5,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DocumentsScreen;
