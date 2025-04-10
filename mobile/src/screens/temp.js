import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const DocumentViewer = ({ visible, onClose, document = null, base64Data = null }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempFilePath, setTempFilePath] = useState(null);
  const [videoStatus, setVideoStatus] = useState({});

  // Determine file type
  const getFileType = () => {
    if (!document) return 'unknown';

    const mediaType = document.media_type || 'document';
    const fileExtension = document.file_type ? document.file_type.toLowerCase() : '';

    if (mediaType === 'image') return 'image';
    if (mediaType === 'video') return 'video';

    // Check common document types
    if (
      ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)
    ) {
      return 'document';
    }

    return 'unknown';
  };

  const fileType = getFileType();

  // Save file temporarily for viewing or sharing
  const saveFileTemporarily = async () => {
    if (!base64Data) {
      setError('No file data available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fileName = document.file_name;
      const tempDir = `${FileSystem.cacheDirectory}temp/`;
      const tempPath = `${tempDir}${fileName}`;

      // Ensure temp directory exists
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      }

      // Convert base64 to file
      await FileSystem.writeAsStringAsync(tempPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setTempFilePath(tempPath);
      setLoading(false);
    } catch (err) {
      console.error('Error saving file:', err);
      setError('Error preparing file for viewing');
      setLoading(false);
    }
  };

  // Handle saving file to device
  const saveToDevice = async () => {
    try {
      if (!tempFilePath) {
        await saveFileTemporarily();
      }

      // Request permissions if needed (for Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need media library permissions to save files');
          return;
        }
      }

      // Save file to media library
      await MediaLibrary.saveToLibraryAsync(tempFilePath);
      alert('File saved to device successfully');
    } catch (err) {
      console.error('Error saving to device:', err);
      alert('Failed to save file to device');
    }
  };

  // Handle sharing file
  const shareFile = async () => {
    try {
      if (!tempFilePath) {
        await saveFileTemporarily();
      }

      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(tempFilePath, {
        mimeType: getMimeType(),
        dialogTitle: `Share ${document.file_name}`,
      });
    } catch (err) {
      console.error('Error sharing file:', err);
      alert('Failed to share file');
    }
  };

  // Get MIME type based on file extension
  const getMimeType = () => {
    if (!document || !document.file_type) return 'application/octet-stream';

    const extension = document.file_type.toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Render file content based on type
  const renderFileContent = () => {
    if (loading || !document) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading file...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.imageContainer}
            minimumZoomScale={1}
            maximumZoomScale={3}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${base64Data}` }}
              style={styles.imageViewer}
              resizeMode="contain"
              onLoad={() => setLoading(false)}
            />
          </ScrollView>
        );

      case 'video':
        return (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: tempFilePath }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={true}
              useNativeControls
              style={styles.videoPlayer}
              onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
              onLoad={() => setLoading(false)}
              onError={error => {
                console.error('Video error:', error);
                setError('Error loading video');
              }}
            />
          </View>
        );

      case 'document':
        if (document.file_type === 'pdf') {
          return (
            <WebView
              source={{ uri: `data:application/pdf;base64,${base64Data}` }}
              style={styles.webView}
              onLoad={() => setLoading(false)}
              onError={() => setError('Error loading PDF')}
              scrollEnabled={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          );
        } else {
          return (
            <View style={styles.unsupportedContainer}>
              <MaterialIcons name="description" size={64} color={theme.colors.primary} />
              <Text style={[styles.documentTitle, { color: theme.colors.text }]}>
                {document.file_name}
              </Text>
              <Text style={[styles.unsupportedText, { color: theme.colors.textSecondary }]}>
                This document type cannot be previewed directly.
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={saveToDevice}
              >
                <MaterialIcons name="save-alt" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Save to Device</Text>
              </TouchableOpacity>
            </View>
          );
        }

      default:
        return (
          <View style={styles.unsupportedContainer}>
            <MaterialIcons name="insert-drive-file" size={64} color={theme.colors.primary} />
            <Text style={[styles.documentTitle, { color: theme.colors.text }]}>
              {document.file_name}
            </Text>
            <Text style={[styles.unsupportedText, { color: theme.colors.textSecondary }]}>
              This file type is not supported for preview.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={saveToDevice}
            >
              <MaterialIcons name="save-alt" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Save to Device</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // Setup when modal becomes visible
  React.useEffect(() => {
    if (visible && document && base64Data) {
      // For videos and some document types, we need to save to a temp file
      if (fileType === 'video' || fileType === 'document') {
        saveFileTemporarily();
      } else {
        // For images, we can use base64 directly
        setLoading(false);
      }
    }
  }, [visible, document, base64Data]);

  // Cleanup when modal closes
  React.useEffect(() => {
    return () => {
      if (tempFilePath) {
        FileSystem.deleteAsync(tempFilePath, { idempotent: true }).catch(err => {
          console.error('Error cleaning up temp file:', err);
        });
      }
    };
  }, [tempFilePath]);

  if (!visible || !document) {
    return null;
  }

  return (
    <Modal
      transparent={false}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text
            style={[styles.fileName, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {document.file_name}
          </Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={shareFile} style={styles.headerAction}>
              <MaterialIcons name="share" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveToDevice} style={styles.headerAction}>
              <MaterialIcons name="save-alt" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>{renderFileContent()}</View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  fileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 5,
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
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
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewer: {
    width: width,
    height: height * 0.8,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: width,
    height: height * 0.8,
  },
  webView: {
    flex: 1,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  unsupportedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DocumentViewer;
