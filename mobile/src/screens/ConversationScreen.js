import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { apiService } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

// Emoji list for the emoji picker
const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '👋'];

const ConversationScreen = ({ route, navigation }) => {
  const { contact } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const flatListRef = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    if (user && user.id && contact) {
      fetchMessages();
      
      // Mark messages as read
      apiService.messages.markAsRead(contact.id, user.id)
        .catch(error => console.error('Error marking messages as read:', error));
      
      // Poll for new messages every 5 seconds
      pollInterval.current = setInterval(() => {
        if (user && user.id && contact) {
          fetchMessages();
        }
      }, 5000);
    }
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [user, contact]);

  const fetchMessages = async () => {
    if (!user || !user.id || !contact) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiService.messages.getConversation(user.id, contact.id);
      if (response.success && response.data && response.data.length > 0) {
        setMessages(response.data || []);
      } else {
        // Use placeholder data for testing if API returns empty or fails
        console.log('Using placeholder data for messages');
        const now = new Date();
        const placeholderMessages = [
          {
            id: 1,
            sender_id: contact.id,
            receiver_id: user.id,
            message: 'Hi there! How are you doing today?',
            is_read: 1,
            created_at: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
            sender: {
              id: contact.id,
              name: contact.name,
              photo_url: contact.photo_url,
              role: contact.role
            },
            receiver: {
              id: user.id,
              name: user.name || 'You',
              photo_url: user.photo_url || null,
              role: user.role || 'User'
            },
            attachments: []
          },
          {
            id: 2,
            sender_id: user.id,
            receiver_id: contact.id,
            message: 'I\'m doing well, thanks for asking! How about you?',
            is_read: 1,
            created_at: new Date(now.getTime() - 3500000).toISOString(), // 58 minutes ago
            sender: {
              id: user.id,
              name: user.name || 'You',
              photo_url: user.photo_url || null,
              role: user.role || 'User'
            },
            receiver: {
              id: contact.id,
              name: contact.name,
              photo_url: contact.photo_url,
              role: contact.role
            },
            attachments: []
          },
          {
            id: 3,
            sender_id: contact.id,
            receiver_id: user.id,
            message: 'I\'m great! Just wanted to check in about the project status.',
            is_read: 1,
            created_at: new Date(now.getTime() - 3400000).toISOString(), // 56 minutes ago
            sender: {
              id: contact.id,
              name: contact.name,
              photo_url: contact.photo_url,
              role: contact.role
            },
            receiver: {
              id: user.id,
              name: user.name || 'You',
              photo_url: user.photo_url || 'https://via.placeholder.com/40',
              role: user.role || 'User'
            },
            attachments: []
          },
          {
            id: 4,
            sender_id: user.id,
            receiver_id: contact.id,
            message: 'We\'re making good progress. I\'ll send you an update with the latest designs soon.',
            is_read: 1,
            created_at: new Date(now.getTime() - 3300000).toISOString(), // 55 minutes ago
            sender: {
              id: user.id,
              name: user.name || 'You',
              photo_url: user.photo_url || 'https://via.placeholder.com/40',
              role: user.role || 'User'
            },
            receiver: {
              id: contact.id,
              name: contact.name,
              photo_url: contact.photo_url,
              role: contact.role
            },
            attachments: []
          },
          {
            id: 5,
            sender_id: contact.id,
            receiver_id: user.id,
            message: 'That sounds great! Looking forward to seeing them.',
            is_read: 0,
            created_at: new Date(now.getTime() - 600000).toISOString(), // 10 minutes ago
            sender: {
              id: contact.id,
              name: contact.name,
              photo_url: contact.photo_url,
              role: contact.role
            },
            receiver: {
              id: user.id,
              name: user.name || 'You',
              photo_url: user.photo_url || 'https://via.placeholder.com/40',
              role: user.role || 'User'
            },
            attachments: []
          }
        ];
        setMessages(placeholderMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Use placeholder data on error
      const now = new Date();
      const placeholderMessages = [
        {
          id: 1,
          sender_id: contact.id,
          receiver_id: user.id,
          message: 'Hi there! How are you doing today?',
          is_read: 1,
          created_at: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
          sender: {
            id: contact.id,
            name: contact.name,
            photo_url: contact.photo_url,
            role: contact.role
          },
          receiver: {
            id: user.id,
            name: user.name || 'You',
            photo_url: user.photo_url || 'https://via.placeholder.com/40',
            role: user.role || 'User'
          },
          attachments: []
        },
        {
          id: 2,
          sender_id: user.id,
          receiver_id: contact.id,
          message: 'I\'m doing well, thanks for asking! How about you?',
          is_read: 1,
          created_at: new Date(now.getTime() - 3500000).toISOString(), // 58 minutes ago
          sender: {
            id: user.id,
            name: user.name || 'You',
            photo_url: user.photo_url || 'https://via.placeholder.com/40',
            role: user.role || 'User'
          },
          receiver: {
            id: contact.id,
            name: contact.name,
            photo_url: contact.photo_url,
            role: contact.role
          },
          attachments: []
        }
      ];
      setMessages(placeholderMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !contact || !user || !user.id) {
      Alert.alert('Error', 'Cannot send message. Please try again later.');
      return;
    }
    
    setSendingMessage(true);
    try {
      let response;
      
      if (attachments.length > 0) {
        // Send message with attachments
        const formData = new FormData();
        formData.append('sender_id', user.id);
        formData.append('receiver_id', contact.id);
        formData.append('message', message);
        
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, {
            uri: file.uri,
            name: file.name || `file-${index}.${file.uri.split('.').pop()}`,
            type: file.type || 'application/octet-stream'
          });
        });
        
        response = await apiService.messages.sendMessageWithAttachments(formData);
      } else {
        // Send text-only message
        response = await apiService.messages.sendMessage({
          sender_id: user.id,
          receiver_id: contact.id,
          message: message.trim()
        });
      }
      
      if (response.success) {
        setMessage('');
        setAttachments([]);
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileExtension = asset.uri.split('.').pop();
        const fileName = `image-${Date.now()}.${fileExtension}`;
        
        setAttachments(prev => [...prev, {
          uri: asset.uri,
          name: fileName,
          type: `image/${fileExtension}`,
          size: asset.fileSize || 0
        }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        setAttachments(prev => [...prev, {
          uri: result.uri,
          name: result.name,
          type: result.mimeType || 'application/octet-stream',
          size: result.size || 0
        }]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <UserAvatar 
            name={item.sender.name}
            photoUrl={item.sender.photo_url}
            size={30}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : {}
          ]}>
            {item.message}
          </Text>
          
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((attachment, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => {
                    // Handle attachment view/download
                  }}
                >
                  <MaterialIcons 
                    name={attachment.file_type.includes('image') ? 'image' : 'insert-drive-file'} 
                    size={24} 
                    color="#007BFF" 
                  />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.file_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <Text style={styles.messageTime}>
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <UserAvatar 
              name={contact?.name}
              photoUrl={contact?.photo_url}
              size={40}
              style={styles.headerAvatar}
            />
            <View>
              <Text style={styles.headerName}>{contact?.name}</Text>
              <Text style={styles.headerStatus}>
                {contact?.is_online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesContainer}
            inverted={false}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />
        )}
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((file, index) => (
                <View key={index} style={styles.attachmentPreviewItem}>
                  {file.type.includes('image') ? (
                    <Image source={{ uri: file.uri }} style={styles.attachmentPreviewImage} />
                  ) : (
                    <View style={styles.attachmentPreviewFile}>
                      <MaterialIcons name="insert-drive-file" size={24} color="#007BFF" />
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeAttachmentButton}
                    onPress={() => removeAttachment(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Input area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              Alert.alert(
                'Attach File',
                'Choose attachment type',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Photo', onPress: pickImage },
                  { text: 'Document', onPress: pickDocument },
                ]
              );
            }}
          >
            <Ionicons name="attach" size={24} color="#007BFF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxHeight={100}
          />
          
          <TouchableOpacity 
            style={styles.emojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Ionicons name="happy-outline" size={24} color="#007BFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() && attachments.length === 0) ? styles.sendButtonDisabled : {}
            ]}
            onPress={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <View style={styles.emojiPickerContainer}>
            <FlatList
              data={emojis}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.emojiItem}
                  onPress={() => handleEmojiClick(item)}
                >
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={8}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerAvatar: {
    marginRight: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: 5,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#007BFF',
  },
  otherMessageBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  attachmentsContainer: {
    marginTop: 5,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 5,
    marginTop: 5,
  },
  attachmentName: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    fontSize: 16,
    maxHeight: 100,
  },
  emojiButton: {
    padding: 5,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  emojiPickerContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 200,
  },
  emojiItem: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  attachmentsPreview: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachmentPreviewItem: {
    position: 'relative',
    marginRight: 10,
  },
  attachmentPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  attachmentPreviewFile: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default ConversationScreen; 