import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskSubmissionScreen = ({ route, navigation }) => {
  // Extract task details from route params
  const { taskId, taskTitle, currentStatus, serviceName } = route.params || {};
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState(null);
  const [expenses, setExpenses] = useState([{ description: '', amount: '', id: Date.now() }]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [manualAttachmentName, setManualAttachmentName] = useState('');
  const [showManualAttachmentModal, setShowManualAttachmentModal] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load user data and task details
  useEffect(() => {
    loadUserData();
    loadTaskDetails();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@fln_liaison_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User data loaded:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('No user data found in AsyncStorage');
        setError('User data not found. Please log in again.');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error loading user data: ' + err.message);
    }
  };

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading task details for ID: ${taskId}`);
      
      if (!taskId) {
        throw new Error('No task ID provided');
      }
      
      // Fetch task details from API
      try {
        console.log('Calling getById API for task:', taskId);
        const response = await apiService.tasks.getById(taskId);
        console.log('Task API response:', response);
        
        if (response && response.data && (response.data.success || response.data.status === 'success')) {
          const taskData = response.data.data || {};
          console.log('Task details loaded:', taskData);
          setTask(taskData);
          
          // Check if this task has already been submitted
          if (taskData.status && taskData.status.toUpperCase() === 'SUBMITTED') {
            console.log('This task has been submitted. Checking for existing submission...');
            await checkForExistingSubmission(taskId);
          } else {
            console.log('Task status is not SUBMITTED:', taskData.status);
          }
        } else {
          console.error('API response indicates failure:', response?.data?.message);
          throw new Error(response?.data?.message || 'Failed to load task details');
        }
      } catch (err) {
        console.error('Error fetching task details, using fallback:', err.message);
        
        // Use route params as fallback
        setTask({
          id: taskId,
          description: taskTitle,
          status: currentStatus,
          service_name: serviceName
        });
        
        // Check if the fallback status is SUBMITTED
        if (currentStatus && currentStatus.toUpperCase() === 'SUBMITTED') {
          console.log('Task status from params is SUBMITTED, checking for submission...');
          await checkForExistingSubmission(taskId);
        }
        
        console.log('Using fallback task data:', {
          id: taskId,
          description: taskTitle,
          status: currentStatus,
          service_name: serviceName
        });
      }
    } catch (err) {
      console.error('Error in loadTaskDetails:', err);
      setError('Failed to load task details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkForExistingSubmission = async (taskId) => {
    try {
      console.log('Checking for existing submission for task:', taskId);
      const response = await apiService.tasks.getSubmissions(taskId);
      console.log('Submissions response:', response);
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        
        const submissions = response.data.data || [];
        console.log('Found submissions:', submissions);
        
        if (submissions.length > 0) {
          // Get the most recent submission
          const latestSubmission = submissions[0];
          console.log('Using latest submission:', latestSubmission);
          
          // Check if the submission has expenses
          if (latestSubmission.expenses && Array.isArray(latestSubmission.expenses)) {
            console.log('Submission has expenses:', latestSubmission.expenses);
          } else if (latestSubmission.expenses_data && Array.isArray(latestSubmission.expenses_data)) {
            console.log('Submission has expenses_data:', latestSubmission.expenses_data);
          } else {
            console.log('Submission missing expenses, fetching separately');
            await fetchExpensesForSubmission(latestSubmission.id);
          }
          
          // Check if the submission has attachments
          if (!latestSubmission.attachments || !Array.isArray(latestSubmission.attachments)) {
            console.log('Submission missing attachments, fetching separately');
            await fetchAttachmentsForSubmission(latestSubmission.id);
          }
          
          // Load the submission data
          loadExistingSubmissionData(latestSubmission);
        } else {
          console.log('No existing submissions found for this task');
        }
      } else {
        console.error('API response indicates failure:', response?.data?.message);
      }
    } catch (err) {
      console.error('Error checking for existing submission:', err);
    }
  };

  const loadExistingSubmissionData = (submission) => {
    try {
      console.log('Loading existing submission data:', submission);
      
      // Set notes
      if (submission.notes) {
        setNotes(submission.notes);
      }
      
      // Load expenses
      console.log('Checking for expenses in submission:', submission);
      
      // Check different possible locations for expenses data
      let expensesData = [];
      
      if (submission.expenses && Array.isArray(submission.expenses)) {
        console.log('Found expenses array directly in submission');
        expensesData = submission.expenses;
      } else if (submission.expenses_data && Array.isArray(submission.expenses_data)) {
        console.log('Found expenses in expenses_data property');
        expensesData = submission.expenses_data;
      }
      
      if (expensesData.length > 0) {
        console.log('Processing expenses data:', expensesData);
        const formattedExpenses = expensesData.map(exp => ({
          id: exp.id || Date.now() + Math.random(),
          description: exp.description || '',
          amount: exp.amount ? exp.amount.toString() : ''
        }));
        
        console.log('Setting formatted expenses:', formattedExpenses);
        setExpenses(formattedExpenses);
      } else {
        // If no expenses found, set empty expense
        console.log('No expenses found, setting empty expense');
        setExpenses([{ description: '', amount: '', id: Date.now() }]);
      }
      
      // Load attachments
      console.log('Loading attachments from submission:', submission);
      if (submission.attachments && Array.isArray(submission.attachments)) {
        const formattedAttachments = submission.attachments.map(att => {
          // Determine attachment type based on file extension or mime type
          let type = 'document';
          const fileType = att.file_type || att.type || '';
          const fileName = att.filename || att.name || '';
          
          if (fileType.startsWith('image/') || 
              fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
            type = 'image';
          } else if (att.file_path === 'manual_attachment') {
            type = 'manual';
          }
          
          return {
            id: att.id || Date.now() + Math.random(),
            uri: att.file_path === 'manual_attachment' ? null : (att.file_url || att.file_path),
            name: att.filename || fileName,
            type: type,
            isExisting: true,
            attachmentId: att.id
          };
        });
        
        console.log('Setting formatted attachments:', formattedAttachments);
        setAttachments(formattedAttachments);
      }
      
      // Set editing mode
      setIsEditing(true);
      setExistingSubmission(submission);
      
    } catch (err) {
      console.error('Error loading existing submission data:', err);
      Alert.alert('Error', 'Failed to load existing submission data: ' + err.message);
    }
  };

  // Fetch expenses for a submission
  const fetchExpensesForSubmission = async (submissionId) => {
    try {
      console.log('Fetching expenses for submission:', submissionId);
      const response = await apiService.tasks.getSubmissionById(submissionId);
      console.log('Submission details response:', response);
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        
        const submissionData = response.data.data || {};
        console.log('Submission details:', submissionData);
        
        // Check different possible locations for expenses data
        let expensesData = [];
        
        if (submissionData.expenses && Array.isArray(submissionData.expenses)) {
          console.log('Found expenses array directly in submission');
          expensesData = submissionData.expenses;
        } else if (submissionData.expenses_data && Array.isArray(submissionData.expenses_data)) {
          console.log('Found expenses in expenses_data property');
          expensesData = submissionData.expenses_data;
        }
        
        if (expensesData.length > 0) {
          console.log('Processing expenses data:', expensesData);
          const formattedExpenses = expensesData.map(exp => ({
            id: exp.id || Date.now() + Math.random(),
            description: exp.description || '',
            amount: exp.amount ? exp.amount.toString() : ''
          }));
          
          console.log('Setting formatted expenses:', formattedExpenses);
          setExpenses(formattedExpenses);
        } else {
          console.log('No expenses found for this submission, setting empty expense');
          // Set default empty expense
          setExpenses([{ description: '', amount: '', id: Date.now() }]);
        }
      } else {
        console.error('API response indicates failure:', response?.data?.message);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  // Add a new expense row
  const addExpense = () => {
    setExpenses([...expenses, { description: '', amount: '', id: Date.now() }]);
  };
  
  // Remove an expense row
  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  // Update expense field
  const updateExpense = (id, field, value) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const fetchAttachmentsForSubmission = async (submissionId) => {
    try {
      console.log('Fetching attachments for submission:', submissionId);
      const response = await apiService.tasks.getSubmissionById(submissionId);
      console.log('Submission details response:', response);
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        
        const submissionData = response.data.data || {};
        console.log('Submission details:', submissionData);
        
        if (submissionData.attachments && Array.isArray(submissionData.attachments)) {
          console.log('Found attachments:', submissionData.attachments);
          
          const formattedAttachments = submissionData.attachments.map(att => {
            // Determine attachment type based on file extension or mime type
            let type = 'document';
            const fileType = att.file_type || att.type || '';
            const fileName = att.filename || att.name || '';
            
            if (fileType.startsWith('image/') || 
                fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
              type = 'image';
            } else if (att.file_path === 'manual_attachment') {
              type = 'manual';
            }
            
            return {
              id: att.id || Date.now() + Math.random(),
              uri: att.file_path === 'manual_attachment' ? null : (att.file_url || att.file_path),
              name: att.filename || fileName,
              type: type,
              isExisting: true,
              attachmentId: att.id
            };
          });
          
          console.log('Setting formatted attachments:', formattedAttachments);
          setAttachments(formattedAttachments);
        } else {
          console.log('No attachments found for this submission');
        }
      } else {
        console.error('API response indicates failure:', response?.data?.message);
      }
    } catch (err) {
      console.error('Error fetching attachments:', err);
    }
  };

  // Handle picking an image
  const pickImage = async (useCamera = false) => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = useCamera 
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
          
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            `We need ${useCamera ? 'camera' : 'photo library'} permissions to upload images.`
          );
          return;
        }
      }
      
      // Launch camera or image picker with fixed options - disable cropping
      const options = {
        quality: 0.8,
        allowsEditing: false, // Disable cropping
      };
      
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }
      
      console.log('Image picker result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newAttachment = {
          uri: result.assets[0].uri,
          type: 'image',
          name: `image_${Date.now()}.jpg`,
          id: Date.now(),
        };
        
        setAttachments([...attachments, newAttachment]);
        console.log('Image added:', newAttachment);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', `Failed to pick image: ${err.message}`);
    }
  };

  // Handle picking a document
  const pickDocument = async () => {
    try {
      // Use simpler options for document picker
      const options = {
        type: '*/*'
      };
      
      const result = await DocumentPicker.getDocumentAsync(options);
      console.log('Document picker result:', result);
      
      if (result.type === 'success') {
        const newAttachment = {
          uri: result.uri,
          type: 'document',
          name: result.name || `document_${Date.now()}`,
          id: Date.now(),
        };
        
        setAttachments([...attachments, newAttachment]);
        console.log('Document added:', newAttachment);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', `Failed to pick document: ${err.message}`);
    }
  };

  // Handle removing an attachment
  const removeAttachment = (id) => {
    // Check if this is an existing attachment
    const attachmentToRemove = attachments.find(att => att.id === id);
    
    if (attachmentToRemove && attachmentToRemove.isExisting) {
      // Confirm deletion of existing attachment
      Alert.alert(
        'Delete Attachment',
        'Are you sure you want to delete this attachment? This cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // If we have the attachment ID, we can delete it from the server
              if (attachmentToRemove.attachmentId) {
                deleteAttachment(attachmentToRemove.attachmentId);
              }
              
              // Remove from local state
              setAttachments(attachments.filter(attachment => attachment.id !== id));
            }
          }
        ]
      );
    } else {
      // For new attachments, just remove from state
      setAttachments(attachments.filter(attachment => attachment.id !== id));
    }
  };

  // Delete an attachment from the server
  const deleteAttachment = async (attachmentId) => {
    try {
      console.log('Deleting attachment:', attachmentId);
      const response = await apiService.tasks.deleteSubmissionAttachment(attachmentId);
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        console.log('Attachment deleted successfully');
      } else {
        throw new Error(response?.data?.message || 'Failed to delete attachment');
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
      Alert.alert('Error', 'Failed to delete attachment: ' + err.message);
    }
  };

  // Add a manual attachment (no file, just a name)
  const addManualAttachment = () => {
    if (!manualAttachmentName.trim()) {
      Alert.alert('Error', 'Please enter a name for the attachment');
      return;
    }
    
    const newAttachment = {
      id: Date.now(),
      name: manualAttachmentName,
      type: 'manual'
    };
    
    setAttachments([...attachments, newAttachment]);
    setManualAttachmentName('');
    setShowManualAttachmentModal(false);
  };

  const handleSubmit = async () => {
    try {
      // Validate input
      if (!notes.trim() && attachments.length === 0 && expenses.every(exp => !exp.description && !exp.amount)) {
        Alert.alert('Validation Error', 'Please add notes, expenses, or attachments to submit the task');
        return;
      }
      
      // Validate expenses
      if (expenses.some(exp => (exp.description && !exp.amount) || (!exp.description && exp.amount))) {
        Alert.alert('Validation Error', 'Please complete both description and amount for all expenses');
        return;
      }
      
      // Confirm submission
      Alert.alert(
        'Submit Task',
        isEditing 
          ? 'Are you sure you want to update this task submission?' 
          : 'Are you sure you want to submit this task as completed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: isEditing ? 'Update' : 'Submit',
            onPress: submitTask,
          },
        ]
      );
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      Alert.alert('Error', 'An unexpected error occurred: ' + err.message);
    }
  };

  const submitTask = async () => {
    try {
      setSubmitting(true);
      
      console.log(`${isEditing ? 'Updating' : 'Submitting'} task with:`, {
        taskId,
        submissionId: existingSubmission?.id,
        liaisonId: user?.id,
        expenses: expenses.filter(e => e.description && e.amount),
        notes,
        attachments: attachments.map(a => a.name),
      });
      
      // Create form data
      const formData = new FormData();
      
      // Add task ID
      formData.append('task_id', taskId);
      
      // Add notes
      formData.append('notes', notes);
      
      // Add liaison ID
      if (user && user.id) {
        formData.append('liaison_id', user.id);
      }
      
      // If editing, include the submission ID
      if (isEditing && existingSubmission?.id) {
        formData.append('submission_id', existingSubmission.id);
      }
      
      // Add expenses
      const validExpenses = expenses.filter(exp => exp.description && exp.amount);
      if (validExpenses.length > 0) {
        formData.append('expenses', JSON.stringify(validExpenses.map(exp => ({
          description: exp.description,
          amount: parseFloat(exp.amount),
          id: exp.id // Include ID for existing expenses
        }))));
      }
      
      // Add attachments
      const attachmentNames = [];
      const existingAttachmentIds = [];
      
      attachments.forEach((attachment, index) => {
        // For existing attachments, just add the ID to the list
        if (attachment.isExisting && attachment.attachmentId) {
          existingAttachmentIds.push(attachment.attachmentId);
        }
        // For manual attachments, just add the name to the list
        else if (attachment.type === 'manual') {
          attachmentNames.push(attachment.name);
        } else {
          // For new file attachments, add to formData
          // Create a file object from the uri
          const uriParts = attachment.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('attachments[]', {
            uri: Platform.OS === 'ios' ? attachment.uri.replace('file://', '') : attachment.uri,
            type: attachment.type === 'image' ? `image/${fileType}` : 'application/octet-stream',
            name: attachment.name || `file_${index}.${fileType}`,
          });
        }
      });
      
      // Add manual attachment names as a separate field
      if (attachmentNames.length > 0) {
        formData.append('manual_attachments', JSON.stringify(attachmentNames));
      }
      
      // Add existing attachment IDs
      if (existingAttachmentIds.length > 0) {
        formData.append('existing_attachment_ids', JSON.stringify(existingAttachmentIds));
      }
      
      console.log('Submitting task with form data:', formData);
      
      // Submit to API
      let response;
      if (isEditing && existingSubmission) {
        // Update existing submission
        response = await apiService.tasks.updateSubmission(formData);
      } else {
        // Create new submission
        response = await apiService.tasks.submitCompletion(formData);
      }
      
      console.log('Task submission response:', response);
      
      if (response && response.data && 
          (response.data.success || response.data.status === 'success')) {
        // Update task status to SUBMITTED (only for new submissions)
        if (!isEditing) {
          await apiService.tasks.updateStatus(taskId, { status: 'SUBMITTED' });
        }
        
        // Show success message
        Alert.alert(
          'Success',
          isEditing ? 'Task submission updated successfully' : 'Task submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response?.data?.message || 'Failed to submit task');
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      Alert.alert('Error', 'Failed to submit task: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Render an attachment item
  const renderAttachmentItem = ({ item }) => (
    <View style={styles.attachmentItem}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={styles.attachmentThumbnail} />
      ) : item.type === 'document' ? (
        <View style={styles.documentIcon}>
          <MaterialIcons name="description" size={24} color="#007BFF" />
        </View>
      ) : (
        <View style={styles.manualIcon}>
          <MaterialIcons name="note" size={24} color="#FF9800" />
        </View>
      )}
      <Text style={styles.attachmentName} numberOfLines={1} ellipsizeMode="middle">
        {item.name}
      </Text>
      <TouchableOpacity 
        style={styles.removeAttachmentButton}
        onPress={() => removeAttachment(item.id)}
      >
        <MaterialIcons name="close" size={18} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Task Details */}
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task?.description || taskTitle}</Text>
            <View style={styles.taskMeta}>
              {task?.service_name && (
                <Text style={styles.taskService}>Service: {task.service_name}</Text>
              )}
              <Text style={styles.taskStatus}>
                Status: <Text style={styles.statusText}>{task?.status || currentStatus}</Text>
              </Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder="Add notes about the completed task..."
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Expenses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            {expenses.map((expense, index) => (
              <View key={expense.id} style={styles.expenseRow}>
                <View style={styles.expenseInputs}>
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Description"
                    value={expense.description}
                    onChangeText={(text) => updateExpense(expense.id, 'description', text)}
                  />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={expense.amount}
                    onChangeText={(text) => updateExpense(expense.id, 'amount', text)}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeExpense(expense.id)}
                >
                  <MaterialIcons name="remove-circle" size={24} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addExpense}
            >
              <MaterialIcons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>

          {/* Attachments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            
            <View style={styles.attachmentButtons}>
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={() => pickImage(false)}
              >
                <MaterialIcons name="photo-library" size={20} color="#007BFF" />
                <Text style={styles.attachmentButtonText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={() => pickImage(true)}
              >
                <MaterialIcons name="camera-alt" size={20} color="#007BFF" />
                <Text style={styles.attachmentButtonText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={pickDocument}
              >
                <MaterialIcons name="attach-file" size={20} color="#007BFF" />
                <Text style={styles.attachmentButtonText}>Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={() => setShowManualAttachmentModal(true)}
              >
                <MaterialIcons name="note-add" size={20} color="#007BFF" />
                <Text style={styles.attachmentButtonText}>Manual</Text>
              </TouchableOpacity>
            </View>
            
            {/* Attachments List */}
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map(item => renderAttachmentItem({ item }))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Submission' : 'Submit Task'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Manual Attachment Modal */}
      <Modal
        visible={showManualAttachmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowManualAttachmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Attachment Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter attachment name"
              value={manualAttachmentName}
              onChangeText={setManualAttachmentName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowManualAttachmentModal(false);
                  setManualAttachmentName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addModalButton]}
                onPress={addManualAttachment}
              >
                <Text style={styles.addModalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  taskHeader: {
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  taskMeta: {
    marginTop: 5,
  },
  taskService: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  // Expense styles
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  descriptionInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Attachment styles
  attachmentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  attachmentButtonText: {
    color: '#333',
    marginLeft: 4,
    fontSize: 14,
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  manualIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeAttachmentButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAttachmentsText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  cancelButtonText: {
    color: '#fff',
  },
  addModalButton: {
    backgroundColor: '#842624',
  },
  addModalButtonText: {
    color: '#fff',
  },
});

export default TaskSubmissionScreen; 