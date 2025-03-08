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
  Modal,
  SafeAreaView,
  Button
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JobOrderSubmissionScreen = ({ route, navigation }) => {
  // Extract job order details from route params
  const { jobOrderId, jobOrderTitle } = route.params || {};
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [jobOrder, setJobOrder] = useState(null);
  const [expenses, setExpenses] = useState([{ description: '', amount: '', id: Date.now() }]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [manualAttachmentName, setManualAttachmentName] = useState('');
  const [showManualAttachmentModal, setShowManualAttachmentModal] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load user data and job order details
  useEffect(() => {
    loadUserData();
    loadJobOrderDetails();
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

  const loadJobOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading job order details for ID: ${jobOrderId}`);
      
      if (!jobOrderId) {
        throw new Error('No job order ID provided');
      }
      
      // Fetch job order details from API
      try {
        console.log('Calling getById API for job order:', jobOrderId);
        const response = await apiService.jobOrders.getById(jobOrderId);
        console.log('Job order API response:', response);
        
        if (response && response.data && (response.data.success || response.data.status === 'success')) {
          const jobOrderData = response.data.data || {};
          console.log('Job order details loaded:', jobOrderData);
          setJobOrder(jobOrderData);
          
          // Check if this job order has already been submitted
          if (jobOrderData.status && jobOrderData.status.toLowerCase() === 'submitted') {
            console.log('This job order has already been submitted. Checking for existing submission...');
            await checkForExistingSubmission(jobOrderId);
          } else {
            console.log('Job order status is not Submitted:', jobOrderData.status);
          }
        } else {
          console.error('API response indicates failure:', response?.data?.message);
          throw new Error(response?.data?.message || 'Failed to load job order details');
        }
      } catch (err) {
        console.error('Error fetching job order details, using fallback:', err.message);
        
        // Fallback to mock data if API call fails
        const mockJobOrder = {
          id: jobOrderId,
          title: jobOrderTitle || 'Job Order',
          description: 'Job order description',
          status: 'In Progress',
          service_name: 'Service Name',
          fee: 1000,
        };
        
        setJobOrder(mockJobOrder);
        console.log('Using mock job order details:', mockJobOrder);
        
        // Still try to check for existing submissions
        await checkForExistingSubmission(jobOrderId);
      }
      
    } catch (err) {
      console.error('Error loading job order details:', err.message);
      setError(`Failed to load job order details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing submission
  const checkForExistingSubmission = async (jobOrderId) => {
    try {
      console.log(`[DEBUG] checkForExistingSubmission - Starting for job order ID: ${jobOrderId}`);
      
      const response = await apiService.jobOrders.getSubmissions(jobOrderId);
      console.log('[DEBUG] checkForExistingSubmission - API response:', JSON.stringify(response));
      
      if (response && response.data && (response.data.success || response.data.status === 'success')) {
        const submissions = response.data.data || [];
        console.log(`[DEBUG] checkForExistingSubmission - Found ${submissions.length} submissions:`, JSON.stringify(submissions));
        
        if (submissions.length > 0) {
          // Get the most recent submission
          const latestSubmission = submissions[0];
          console.log('[DEBUG] checkForExistingSubmission - Latest submission:', JSON.stringify(latestSubmission));
          
          // Check if the submission has the expected data
          if (!latestSubmission.id) {
            console.error('[DEBUG] checkForExistingSubmission - Submission is missing ID:', JSON.stringify(latestSubmission));
            return;
          }
          
          // Fetch the full submission data directly
          try {
            console.log(`[DEBUG] checkForExistingSubmission - Fetching full submission data for ID: ${latestSubmission.id}`);
            const fullSubmissionResponse = await apiService.jobOrders.getSubmissionById(latestSubmission.id);
            console.log('[DEBUG] checkForExistingSubmission - Full submission response:', JSON.stringify(fullSubmissionResponse));
            
            if (fullSubmissionResponse && fullSubmissionResponse.data && 
                (fullSubmissionResponse.data.success || fullSubmissionResponse.data.status === 'success')) {
              // Use the full submission data
              const fullSubmission = fullSubmissionResponse.data.data || latestSubmission;
              console.log('[DEBUG] checkForExistingSubmission - Using full submission data:', JSON.stringify(fullSubmission));
              
              // Log the structure of the full submission
              console.log('[DEBUG] checkForExistingSubmission - Full submission keys:', Object.keys(fullSubmission));
              if (fullSubmission.expenses) {
                console.log('[DEBUG] checkForExistingSubmission - Expenses found:', JSON.stringify(fullSubmission.expenses));
              }
              if (fullSubmission.expenses_data) {
                console.log('[DEBUG] checkForExistingSubmission - Expenses_data found:', JSON.stringify(fullSubmission.expenses_data));
              }
              if (fullSubmission.attachments) {
                console.log('[DEBUG] checkForExistingSubmission - Attachments found:', JSON.stringify(fullSubmission.attachments));
              }
              if (fullSubmission.attachments_data) {
                console.log('[DEBUG] checkForExistingSubmission - Attachments_data found:', JSON.stringify(fullSubmission.attachments_data));
              }
              
              setExistingSubmission(fullSubmission);
              setIsEditing(true);
              
              // Load the existing submission data
              await loadExistingSubmissionData(fullSubmission);
              return;
            }
          } catch (err) {
            console.error('[DEBUG] checkForExistingSubmission - Error fetching full submission:', err.message);
            // Continue with the original submission data
          }
          
          // Fallback to using the original submission data
          console.log('[DEBUG] checkForExistingSubmission - Falling back to original submission data');
          setExistingSubmission(latestSubmission);
          setIsEditing(true);
          
          // Load the existing submission data
          await loadExistingSubmissionData(latestSubmission);
        } else {
          console.log('[DEBUG] checkForExistingSubmission - No existing submissions found');
        }
      } else {
        console.log('[DEBUG] checkForExistingSubmission - Failed to check for submissions:', response?.data?.message);
      }
    } catch (err) {
      console.error('[DEBUG] checkForExistingSubmission - Error:', err.message);
      // Continue without loading existing submission
    }
  };

  // Load existing submission data
  const loadExistingSubmissionData = async (submission) => {
    try {
      console.log('[DEBUG] loadExistingSubmissionData - Starting with submission:', JSON.stringify(submission));
      console.log('[DEBUG] loadExistingSubmissionData - Submission type:', typeof submission);
      console.log('[DEBUG] loadExistingSubmissionData - Submission keys:', Object.keys(submission));
      
      // Dump the entire submission structure for debugging
      console.log('[DEBUG] loadExistingSubmissionData - Full submission structure:');
      for (const key in submission) {
        const value = submission[key];
        const valueType = typeof value;
        if (valueType === 'object' && value !== null) {
          console.log(`  ${key} (${valueType}):`, JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : ''));
        } else {
          console.log(`  ${key} (${valueType}):`, value);
        }
      }
      
      // If submission doesn't have an ID, we can't proceed
      if (!submission.id) {
        console.error('[DEBUG] loadExistingSubmissionData - Submission is missing ID:', JSON.stringify(submission));
        return;
      }
      
      // Try to fetch the full submission data directly
      try {
        console.log(`[DEBUG] loadExistingSubmissionData - Fetching full submission data for ID: ${submission.id}`);
        const response = await apiService.jobOrders.getSubmissionById(submission.id);
        console.log('[DEBUG] loadExistingSubmissionData - Full submission response:', JSON.stringify(response));
        
        if (response && response.data && (response.data.success || response.data.status === 'success')) {
          // Use the full submission data instead
          const originalSubmission = submission;
          submission = response.data.data || submission;
          console.log('[DEBUG] loadExistingSubmissionData - Using full submission data:', JSON.stringify(submission));
          console.log('[DEBUG] loadExistingSubmissionData - Comparing with original submission:');
          console.log('  Original had expenses:', !!originalSubmission.expenses);
          console.log('  Original had expenses_data:', !!originalSubmission.expenses_data);
          console.log('  New has expenses:', !!submission.expenses);
          console.log('  New has expenses_data:', !!submission.expenses_data);
          console.log('  Original had attachments:', !!originalSubmission.attachments);
          console.log('  Original had attachments_data:', !!originalSubmission.attachments_data);
          console.log('  New has attachments:', !!submission.attachments);
          console.log('  New has attachments_data:', !!submission.attachments_data);
        }
      } catch (err) {
        console.error('[DEBUG] loadExistingSubmissionData - Error fetching full submission:', err.message);
        // Continue with the original submission data
      }
      
      // Load notes
      if (submission.notes) {
        console.log('[DEBUG] loadExistingSubmissionData - Setting notes:', submission.notes);
        setNotes(submission.notes);
      } else {
        console.log('[DEBUG] loadExistingSubmissionData - No notes found in submission');
      }
      
      // Load expenses
      console.log('[DEBUG] loadExistingSubmissionData - Checking for expenses in submission');
      console.log('[DEBUG] loadExistingSubmissionData - Submission keys:', Object.keys(submission));
      
      // Check different possible locations for expenses data
      let expensesData = [];
      
      if (submission.expenses && Array.isArray(submission.expenses)) {
        console.log('[DEBUG] loadExistingSubmissionData - Found expenses array:', JSON.stringify(submission.expenses));
        expensesData = submission.expenses;
      } else if (submission.expenses_data && Array.isArray(submission.expenses_data)) {
        console.log('[DEBUG] loadExistingSubmissionData - Found expenses_data array:', JSON.stringify(submission.expenses_data));
        expensesData = submission.expenses_data;
      } else {
        console.log('[DEBUG] loadExistingSubmissionData - No expenses found in submission');
        
        // Check if expenses might be nested deeper
        for (const key in submission) {
          if (typeof submission[key] === 'object' && submission[key] !== null) {
            console.log(`[DEBUG] loadExistingSubmissionData - Checking nested object '${key}'`);
            if (submission[key].expenses && Array.isArray(submission[key].expenses)) {
              console.log(`[DEBUG] loadExistingSubmissionData - Found expenses in nested object '${key}'`);
              expensesData = submission[key].expenses;
              break;
            }
          }
        }
        
        if (expensesData.length === 0) {
          // Try to fetch expenses separately
          console.log('[DEBUG] loadExistingSubmissionData - Will try to fetch expenses separately');
          await fetchExpensesForSubmission(submission.id);
        }
      }
      
      if (expensesData.length > 0) {
        console.log('[DEBUG] loadExistingSubmissionData - Processing expenses data:', JSON.stringify(expensesData));
        console.log('[DEBUG] loadExistingSubmissionData - Expenses data type:', Array.isArray(expensesData) ? 'Array' : typeof expensesData);
        
        // Log each expense item for debugging
        expensesData.forEach((exp, index) => {
          console.log(`[DEBUG] loadExistingSubmissionData - Expense #${index}:`, JSON.stringify(exp));
          console.log(`[DEBUG] loadExistingSubmissionData - Expense #${index} properties:`, Object.keys(exp));
        });
        
        const formattedExpenses = expensesData.map(exp => ({
          description: exp.description || '',
          amount: exp.amount ? exp.amount.toString() : '',
          id: exp.id || Date.now() + Math.random()
        }));
        
        console.log('[DEBUG] loadExistingSubmissionData - Formatted expenses:', JSON.stringify(formattedExpenses));
        
        if (formattedExpenses.length > 0) {
          console.log('[DEBUG] loadExistingSubmissionData - Setting expenses:', JSON.stringify(formattedExpenses));
          console.log('[DEBUG] loadExistingSubmissionData - Current expenses state before setting:', JSON.stringify(expenses));
          setExpenses(formattedExpenses);
          
          // Verify expenses state was updated
          setTimeout(() => {
            console.log('[DEBUG] loadExistingSubmissionData - Expenses state after setting (timeout check):', JSON.stringify(expenses));
          }, 100);
        } else {
          console.log('[DEBUG] loadExistingSubmissionData - No formatted expenses to set');
        }
      } else {
        console.log('[DEBUG] loadExistingSubmissionData - No expenses data to process');
      }
      
      // Load attachments
      console.log('[DEBUG] loadExistingSubmissionData - Checking for attachments in submission');
      
      // Check different possible locations for attachments data
      let attachmentsData = [];
      
      if (submission.attachments && Array.isArray(submission.attachments)) {
        console.log('[DEBUG] loadExistingSubmissionData - Found attachments array:', JSON.stringify(submission.attachments));
        attachmentsData = submission.attachments;
      } else if (submission.attachments_data && Array.isArray(submission.attachments_data)) {
        console.log('[DEBUG] loadExistingSubmissionData - Found attachments_data array:', JSON.stringify(submission.attachments_data));
        attachmentsData = submission.attachments_data;
      } else {
        console.log('[DEBUG] loadExistingSubmissionData - No attachments found in submission');
        
        // Check if attachments might be nested deeper
        for (const key in submission) {
          if (typeof submission[key] === 'object' && submission[key] !== null) {
            console.log(`[DEBUG] loadExistingSubmissionData - Checking nested object '${key}'`);
            if (submission[key].attachments && Array.isArray(submission[key].attachments)) {
              console.log(`[DEBUG] loadExistingSubmissionData - Found attachments in nested object '${key}'`);
              attachmentsData = submission[key].attachments;
              break;
            }
          }
        }
        
        if (attachmentsData.length === 0) {
          // Try to fetch attachments separately
          console.log('[DEBUG] loadExistingSubmissionData - Will try to fetch attachments separately');
          await fetchAttachmentsForSubmission(submission.id);
        }
      }
      
      if (attachmentsData.length > 0) {
        console.log('[DEBUG] loadExistingSubmissionData - Processing attachments data:', JSON.stringify(attachmentsData));
        console.log('[DEBUG] loadExistingSubmissionData - Attachments data type:', Array.isArray(attachmentsData) ? 'Array' : typeof attachmentsData);
        
        // Log each attachment item for debugging
        attachmentsData.forEach((att, index) => {
          console.log(`[DEBUG] loadExistingSubmissionData - Attachment #${index}:`, JSON.stringify(att));
          console.log(`[DEBUG] loadExistingSubmissionData - Attachment #${index} properties:`, Object.keys(att));
        });
        
        const formattedAttachments = attachmentsData.map(att => ({
          uri: att.file_path || 'placeholder',
          type: att.file_type && att.file_type.includes('image') ? 'image' : 'document',
          name: att.file_name || `file_${Date.now()}`,
          id: att.id || Date.now() + Math.random(),
          isExisting: true, // Flag to indicate this is an existing attachment
          attachmentId: att.id // Store the original attachment ID
        }));
        
        console.log('[DEBUG] loadExistingSubmissionData - Formatted attachments:', JSON.stringify(formattedAttachments));
        
        if (formattedAttachments.length > 0) {
          console.log('[DEBUG] loadExistingSubmissionData - Setting attachments:', JSON.stringify(formattedAttachments));
          console.log('[DEBUG] loadExistingSubmissionData - Current attachments state before setting:', JSON.stringify(attachments));
          setAttachments(formattedAttachments);
          
          // Verify attachments state was updated
          setTimeout(() => {
            console.log('[DEBUG] loadExistingSubmissionData - Attachments state after setting (timeout check):', JSON.stringify(attachments));
          }, 100);
        } else {
          console.log('[DEBUG] loadExistingSubmissionData - No formatted attachments to set');
        }
      } else {
        console.log('[DEBUG] loadExistingSubmissionData - No attachments data to process');
      }
    } catch (err) {
      console.error('[DEBUG] loadExistingSubmissionData - Error:', err.message, err.stack);
      // Continue with empty form
    }
  };

  // Fetch expenses for a submission
  const fetchExpensesForSubmission = async (submissionId) => {
    try {
      console.log(`[DEBUG] fetchExpensesForSubmission - Starting for submission ID: ${submissionId}`);
      
      // Fetch the full submission to get expenses
      const response = await apiService.jobOrders.getSubmissionById(submissionId);
      console.log('[DEBUG] fetchExpensesForSubmission - Response:', JSON.stringify(response));
      
      if (response && response.data && (response.data.success || response.data.status === 'success')) {
        const submission = response.data.data || {};
        console.log('[DEBUG] fetchExpensesForSubmission - Submission data:', JSON.stringify(submission));
        
        // Check for expenses in the response
        let expensesData = [];
        
        if (submission.expenses && Array.isArray(submission.expenses)) {
          console.log('[DEBUG] fetchExpensesForSubmission - Found expenses:', JSON.stringify(submission.expenses));
          expensesData = submission.expenses;
        } else if (submission.expenses_data && Array.isArray(submission.expenses_data)) {
          console.log('[DEBUG] fetchExpensesForSubmission - Found expenses_data:', JSON.stringify(submission.expenses_data));
          expensesData = submission.expenses_data;
        } else {
          console.log('[DEBUG] fetchExpensesForSubmission - No expenses found in response');
          console.log('[DEBUG] fetchExpensesForSubmission - Response keys:', Object.keys(submission));
          
          // Check if expenses might be nested deeper
          for (const key in submission) {
            if (typeof submission[key] === 'object' && submission[key] !== null) {
              console.log(`[DEBUG] fetchExpensesForSubmission - Checking nested object '${key}'`);
              if (submission[key].expenses && Array.isArray(submission[key].expenses)) {
                console.log(`[DEBUG] fetchExpensesForSubmission - Found expenses in nested object '${key}'`);
                expensesData = submission[key].expenses;
                break;
              }
            }
          }
        }
        
        if (expensesData.length > 0) {
          console.log('[DEBUG] fetchExpensesForSubmission - Processing expenses data:', JSON.stringify(expensesData));
          
          // Log each expense item for debugging
          expensesData.forEach((exp, index) => {
            console.log(`[DEBUG] fetchExpensesForSubmission - Expense #${index}:`, JSON.stringify(exp));
          });
          
          const formattedExpenses = expensesData.map(exp => ({
            description: exp.description || '',
            amount: exp.amount ? exp.amount.toString() : '',
            id: exp.id || Date.now() + Math.random()
          }));
          
          console.log('[DEBUG] fetchExpensesForSubmission - Setting expenses:', JSON.stringify(formattedExpenses));
          console.log('[DEBUG] fetchExpensesForSubmission - Current expenses state before setting:', JSON.stringify(expenses));
          setExpenses(formattedExpenses);
          
          // Verify expenses state was updated
          setTimeout(() => {
            console.log('[DEBUG] fetchExpensesForSubmission - Expenses state after setting (timeout check):', JSON.stringify(expenses));
          }, 100);
        } else {
          console.log('[DEBUG] fetchExpensesForSubmission - No expenses found');
        }
      } else {
        console.log('[DEBUG] fetchExpensesForSubmission - Invalid response:', JSON.stringify(response));
      }
    } catch (err) {
      console.error('[DEBUG] fetchExpensesForSubmission - Error:', err.message, err.stack);
    }
  };

  // Fetch attachments for a submission
  const fetchAttachmentsForSubmission = async (submissionId) => {
    try {
      console.log(`[DEBUG] fetchAttachmentsForSubmission - Starting for submission ID: ${submissionId}`);
      
      // Fetch the full submission to get attachments
      const response = await apiService.jobOrders.getSubmissionById(submissionId);
      console.log('[DEBUG] fetchAttachmentsForSubmission - Response:', JSON.stringify(response));
      
      if (response && response.data && (response.data.success || response.data.status === 'success')) {
        const submission = response.data.data || {};
        console.log('[DEBUG] fetchAttachmentsForSubmission - Submission data:', JSON.stringify(submission));
        
        // Check for attachments in the response
        let attachmentsData = [];
        
        if (submission.attachments && Array.isArray(submission.attachments)) {
          console.log('[DEBUG] fetchAttachmentsForSubmission - Found attachments:', JSON.stringify(submission.attachments));
          attachmentsData = submission.attachments;
        } else if (submission.attachments_data && Array.isArray(submission.attachments_data)) {
          console.log('[DEBUG] fetchAttachmentsForSubmission - Found attachments_data:', JSON.stringify(submission.attachments_data));
          attachmentsData = submission.attachments_data;
        } else {
          console.log('[DEBUG] fetchAttachmentsForSubmission - No attachments found in response');
          console.log('[DEBUG] fetchAttachmentsForSubmission - Response keys:', Object.keys(submission));
          
          // Check if attachments might be nested deeper
          for (const key in submission) {
            if (typeof submission[key] === 'object' && submission[key] !== null) {
              console.log(`[DEBUG] fetchAttachmentsForSubmission - Checking nested object '${key}'`);
              if (submission[key].attachments && Array.isArray(submission[key].attachments)) {
                console.log(`[DEBUG] fetchAttachmentsForSubmission - Found attachments in nested object '${key}'`);
                attachmentsData = submission[key].attachments;
                break;
              }
            }
          }
        }
        
        if (attachmentsData.length > 0) {
          console.log('[DEBUG] fetchAttachmentsForSubmission - Processing attachments data:', JSON.stringify(attachmentsData));
          
          // Log each attachment item for debugging
          attachmentsData.forEach((att, index) => {
            console.log(`[DEBUG] fetchAttachmentsForSubmission - Attachment #${index}:`, JSON.stringify(att));
          });
          
          const formattedAttachments = attachmentsData.map(att => ({
            uri: att.file_path || 'placeholder',
            type: att.file_type && att.file_type.includes('image') ? 'image' : 'document',
            name: att.file_name || `file_${Date.now()}`,
            id: att.id || Date.now() + Math.random(),
            isExisting: true,
            attachmentId: att.id
          }));
          
          console.log('[DEBUG] fetchAttachmentsForSubmission - Setting attachments:', JSON.stringify(formattedAttachments));
          console.log('[DEBUG] fetchAttachmentsForSubmission - Current attachments state before setting:', JSON.stringify(attachments));
          setAttachments(formattedAttachments);
          
          // Verify attachments state was updated
          setTimeout(() => {
            console.log('[DEBUG] fetchAttachmentsForSubmission - Attachments state after setting (timeout check):', JSON.stringify(attachments));
          }, 100);
        } else {
          console.log('[DEBUG] fetchAttachmentsForSubmission - No attachments found');
        }
      } else {
        console.log('[DEBUG] fetchAttachmentsForSubmission - Invalid response:', JSON.stringify(response));
      }
    } catch (err) {
      console.error('[DEBUG] fetchAttachmentsForSubmission - Error:', err.message, err.stack);
    }
  };

  // Handle adding a new expense
  const addExpense = () => {
    setExpenses([...expenses, { description: '', amount: '', id: Date.now() }]);
  };

  // Handle removing an expense
  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Handle updating an expense
  const updateExpense = (id, field, value) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  // Handle picking an image from the camera or gallery
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

  // Delete attachment from server
  const deleteAttachment = async (attachmentId) => {
    try {
      console.log(`Deleting attachment with ID: ${attachmentId}`);
      
      // Call API to delete attachment
      const response = await apiService.jobOrders.deleteSubmissionAttachment(attachmentId);
      
      if (response && response.data && (response.data.success || response.data.status === 'success')) {
        console.log('Attachment deleted successfully');
      } else {
        console.error('API response indicates failure:', response?.data?.message);
        throw new Error(response?.data?.message || 'Failed to delete attachment');
      }
    } catch (err) {
      console.error('Error deleting attachment:', err.message);
      Alert.alert('Error', `Failed to delete attachment: ${err.message}`);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    try {
      console.log('[DEBUG SUBMIT] handleSubmit - Starting submission process');
      console.log('[DEBUG SUBMIT] handleSubmit - Current state:', {
        isEditing,
        existingSubmission: existingSubmission ? { id: existingSubmission.id } : null,
        notes,
        expenses: expenses.length,
        attachments: attachments.length,
        jobOrderId,
        liaisonId: user.id
      });
      
      // Validate inputs
      if (!notes.trim() && expenses.length === 0 && attachments.length === 0) {
        console.log('[DEBUG SUBMIT] handleSubmit - Validation failed: No content to submit');
        Alert.alert('Error', 'Please add notes, expenses, or attachments before submitting.');
        return;
      }

      setSubmitting(true);
      console.log('[DEBUG SUBMIT] handleSubmit - Set isSubmitting to true');

      // Create FormData object
      const formData = new FormData();
      console.log('[DEBUG SUBMIT] handleSubmit - Created FormData object');
      
      // Add job order ID and liaison ID
      formData.append('job_order_id', jobOrderId);
      formData.append('liaison_id', user.id);
      console.log('[DEBUG SUBMIT] handleSubmit - Added job_order_id and liaison_id to FormData:', { jobOrderId, liaisonId: user.id });
      
      // Add notes
      formData.append('notes', notes);
      console.log('[DEBUG SUBMIT] handleSubmit - Added notes to FormData');
      
      // Add expenses
      if (expenses.length > 0) {
        console.log('[DEBUG SUBMIT] handleSubmit - Processing expenses:', JSON.stringify(expenses));
        formData.append('expenses', JSON.stringify(expenses.map(exp => ({
          description: exp.description,
          amount: parseFloat(exp.amount) || 0
        }))));
        console.log('[DEBUG SUBMIT] handleSubmit - Added expenses to FormData');
      }
      
      // Add attachments
      let attachmentCount = 0;
      for (const attachment of attachments) {
        console.log('[DEBUG SUBMIT] handleSubmit - Processing attachment:', JSON.stringify(attachment));
        
        // Skip existing attachments that don't need to be re-uploaded
        if (attachment.isExisting) {
          console.log('[DEBUG SUBMIT] handleSubmit - Skipping existing attachment:', attachment.id);
          continue;
        }
        
        try {
          // For local files, we need to create the file object
          if (attachment.uri && !attachment.uri.startsWith('http')) {
            console.log('[DEBUG SUBMIT] handleSubmit - Adding local file attachment to FormData:', attachment.name);
            
            // Get file extension
            const fileExtension = attachment.name.split('.').pop() || '';
            const fileName = attachment.name || `file_${Date.now()}.${fileExtension}`;
            
            // Create file object
            const file = {
              uri: Platform.OS === 'android' ? attachment.uri : attachment.uri.replace('file://', ''),
              type: attachment.type === 'image' ? `image/${fileExtension || 'jpeg'}` : 'application/octet-stream',
              name: fileName
            };
            
            formData.append(`attachments[${attachmentCount}]`, file);
            attachmentCount++;
            console.log('[DEBUG SUBMIT] handleSubmit - Successfully added attachment to FormData');
          } else {
            console.log('[DEBUG SUBMIT] handleSubmit - Skipping remote attachment:', attachment.uri);
          }
        } catch (err) {
          console.error('[DEBUG SUBMIT] handleSubmit - Error processing attachment:', err.message);
        }
      }
      
      console.log('[DEBUG SUBMIT] handleSubmit - Total attachments added to FormData:', attachmentCount);
      
      // If editing, add submission ID
      if (isEditing && existingSubmission && existingSubmission.id) {
        formData.append('submission_id', existingSubmission.id);
        console.log('[DEBUG SUBMIT] handleSubmit - Added submission_id to FormData:', existingSubmission.id);
      }
      
      // Log the final FormData (as much as possible)
      console.log('[DEBUG SUBMIT] handleSubmit - Final FormData keys:');
      for (const pair of formData._parts) {
        if (pair[0] === 'expenses') {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        } else if (pair[0].startsWith('attachments')) {
          console.log(`  ${pair[0]}: [File object]`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
      
      // Submit the form
      console.log('[DEBUG SUBMIT] handleSubmit - Submitting form data to API');
      const response = await apiService.jobOrders.submitCompletion(formData);
      console.log('[DEBUG SUBMIT] handleSubmit - API response:', JSON.stringify(response.data));
      
      if (response.data.success || response.data.status === 'success') {
        console.log('[DEBUG SUBMIT] handleSubmit - Submission successful');
        Alert.alert(
          'Success',
          isEditing ? 'Job order submission updated successfully!' : 'Job order submitted successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        console.error('[DEBUG SUBMIT] handleSubmit - API returned error:', response.data.message || 'Unknown error');
        Alert.alert('Error', response.data.message || 'Failed to submit job order. Please try again.');
      }
    } catch (err) {
      console.error('[DEBUG SUBMIT] handleSubmit - Exception:', err.message, err.stack);
      Alert.alert('Error', 'Failed to submit job order. Please try again.');
    } finally {
      setSubmitting(false);
      console.log('[DEBUG SUBMIT] handleSubmit - Set isSubmitting to false');
    }
  };

  // Add a manual attachment
  const addManualAttachment = () => {
    if (manualAttachmentName && manualAttachmentName.trim()) {
      const newAttachment = {
        uri: 'placeholder',
        type: 'manual',
        name: manualAttachmentName.trim(),
        id: Date.now(),
      };
      setAttachments([...attachments, newAttachment]);
      setManualAttachmentName('');
      setShowManualAttachmentModal(false);
    } else {
      Alert.alert('Error', 'Please enter a name for the attachment');
    }
  };

  // Add useEffect to monitor expenses state changes
  useEffect(() => {
    console.log('[DEBUG] useEffect - Expenses state changed:', JSON.stringify(expenses));
  }, [expenses]);
  
  // Add useEffect to monitor attachments state changes
  useEffect(() => {
    console.log('[DEBUG] useEffect - Attachments state changed:', JSON.stringify(attachments));
  }, [attachments]);

  // Add debug function
  const showDebugInfo = async () => {
    if (!__DEV__) return;
    
    let debugInfo = `Job Order ID: ${jobOrderId}\n`;
    debugInfo += `Liaison ID: ${user?.id}\n`;
    debugInfo += `Is Editing: ${isEditing ? 'Yes' : 'No'}\n`;
    
    if (isEditing && existingSubmission) {
      debugInfo += `Submission ID: ${existingSubmission.id}\n`;
      debugInfo += `Has expenses in submission: ${existingSubmission.expenses ? 'Yes' : 'No'}\n`;
      debugInfo += `Has expenses_data in submission: ${existingSubmission.expenses_data ? 'Yes' : 'No'}\n`;
      debugInfo += `Has attachments in submission: ${existingSubmission.attachments ? 'Yes' : 'No'}\n`;
      debugInfo += `Has attachments_data in submission: ${existingSubmission.attachments_data ? 'Yes' : 'No'}\n`;
      
      // Call the debug endpoint to directly check the database
      try {
        console.log('[DEBUG UI] Calling debug endpoint to check database directly');
        const response = await apiService.jobOrders.debugGetExpensesAndAttachments(existingSubmission.id);
        
        if (response && response.data && response.data.success) {
          const dbData = response.data.data;
          debugInfo += `\nDIRECT DATABASE CHECK:\n`;
          debugInfo += `DB Expenses count: ${dbData.expenses ? dbData.expenses.length : 0}\n`;
          debugInfo += `DB Attachments count: ${dbData.attachments ? dbData.attachments.length : 0}\n`;
          
          if (dbData.expenses && dbData.expenses.length > 0) {
            debugInfo += `\nDB Expenses:\n`;
            dbData.expenses.forEach((exp, index) => {
              debugInfo += `  ${index + 1}. ${exp.description}: $${exp.amount}\n`;
            });
          }
          
          if (dbData.attachments && dbData.attachments.length > 0) {
            debugInfo += `\nDB Attachments:\n`;
            dbData.attachments.forEach((att, index) => {
              debugInfo += `  ${index + 1}. ${att.file_name}\n`;
            });
          }
        }
      } catch (err) {
        console.error('[DEBUG UI] Error calling debug endpoint:', err.message);
        debugInfo += `\nError checking database directly: ${err.message}\n`;
      }
    }
    
    debugInfo += `\nExpenses in state: ${expenses.length}\n`;
    if (expenses.length > 0) {
      debugInfo += `Expense items:\n`;
      expenses.forEach((exp, index) => {
        debugInfo += `  ${index + 1}. ${exp.description}: $${exp.amount}\n`;
      });
    }
    
    debugInfo += `\nAttachments in state: ${attachments.length}\n`;
    if (attachments.length > 0) {
      debugInfo += `Attachment items:\n`;
      attachments.forEach((att, index) => {
        debugInfo += `  ${index + 1}. ${att.name}\n`;
      });
    }
    
    Alert.alert('Debug Information', debugInfo, [
      { 
        text: 'Refresh Data', 
        onPress: () => {
          if (isEditing && existingSubmission && existingSubmission.id) {
            console.log('[DEBUG UI] Manually refreshing expenses and attachments');
            fetchExpensesForSubmission(existingSubmission.id);
            fetchAttachmentsForSubmission(existingSubmission.id);
          }
        } 
      },
      { text: 'OK' }
    ]);
  };

  // Render loading state
  if (loading) {
    return (
      <ScreenWrapper 
        title="Job Order Submission" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading job order details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Render error state
  if (error) {
    return (
      <ScreenWrapper 
        title="Job Order Submission" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>
            {error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadJobOrderDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper 
      title={isEditing ? `Edit: ${jobOrder?.title || 'Job Order'}` : `Submit: ${jobOrder?.title || 'Job Order'}`}
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <Modal
        animationType="slide"
        transparent={true}
        visible={showManualAttachmentModal}
        onRequestClose={() => setShowManualAttachmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Manual Attachment</Text>
            <TextInput
              style={styles.input}
              placeholder="File Name"
              value={manualAttachmentName}
              onChangeText={setManualAttachmentName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowManualAttachmentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addManualAttachment}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                {/* Debug Button (only in dev mode) */}
                {__DEV__ && (
                  <TouchableOpacity 
                    style={styles.debugButton} 
                    onPress={showDebugInfo}
                  >
                    <Text style={styles.debugButtonText}>Debug Info</Text>
                  </TouchableOpacity>
                )}

                {/* Job Order Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Job Order Details</Text>
                  <Text style={styles.jobOrderTitle}>{jobOrderTitle}</Text>
                  {isEditing && (
                    <View style={styles.editingBadge}>
                      <Icon name="edit" size={14} color="#fff" />
                      <Text style={styles.editingBadgeText}>Editing Submission</Text>
                    </View>
                  )}
                </View>

                <KeyboardAvoidingView 
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={{ flex: 1 }}
                >
                  <ScrollView style={styles.scrollView}>
                    {/* Job Order Info */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Job Order Information</Text>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Title:</Text>
                        <Text style={styles.infoValue}>{jobOrder?.title || jobOrderTitle || 'N/A'}</Text>
                        
                        <Text style={styles.infoLabel}>Service:</Text>
                        <Text style={styles.infoValue}>{jobOrder?.service_name || 'N/A'}</Text>
                        
                        <Text style={styles.infoLabel}>Status:</Text>
                        <Text style={styles.infoValue}>{jobOrder?.status || 'N/A'}</Text>
                        
                        {isEditing && (
                          <View style={styles.editingBadge}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                            <Text style={styles.editingBadgeText}>Editing Existing Submission</Text>
                          </View>
                        )}
                      </View>
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
                        style={{
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
                        }}
                        onPress={addExpense}
                      >
                        <MaterialIcons name="add-circle" size={20} color="#fff" />
                        <Text style={{
                          color: '#fff',
                          marginLeft: 5,
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>Add Expense</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Notes Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <TextInput
                        style={styles.notesInput}
                        placeholder="Enter any additional notes here..."
                        multiline={true}
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                      />
                    </View>
                    
                    {/* Attachments Section */}
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
                          <MaterialIcons name="edit" size={20} color="#007BFF" />
                          <Text style={styles.attachmentButtonText}>Manual</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Attachment List */}
                      {attachments.length > 0 ? (
                        <FlatList
                          data={attachments}
                          keyExtractor={item => item.id.toString()}
                          renderItem={({ item }) => (
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
                          )}
                          style={styles.attachmentList}
                        />
                      ) : (
                        <Text style={styles.noAttachmentsText}>No attachments added yet</Text>
                      )}
                    </View>
                    
                    {/* Submit Button */}
                    <TouchableOpacity 
                      style={styles.submitButton}
                      onPress={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {isEditing ? 'Update Submission' : 'Submit Job Order'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </KeyboardAvoidingView>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 15,
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
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 10,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
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
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  attachmentButtonText: {
    color: '#007BFF',
    marginLeft: 5,
  },
  attachmentList: {
    marginTop: 10,
    maxHeight: 200,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  manualIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fff',
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
    padding: 5,
  },
  noAttachmentsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007BFF',
  },
  editingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9c27b0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  editingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#dc3545',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  jobOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  debugButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default JobOrderSubmissionScreen; 