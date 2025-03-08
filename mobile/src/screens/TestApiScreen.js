import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import axios from 'axios';
import { switchApiUrl } from '../services/api';

const TestApiScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useNgrok, setUseNgrok] = useState(Platform.OS !== 'web');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get the current API URL
  const getApiUrl = () => {
    return useNgrok 
      ? 'https://01c4-120-28-70-225.ngrok-free.app' 
      : 'http://localhost:4005';
  };

  // Toggle between local and ngrok URLs
  const toggleApiUrl = () => {
    setUseNgrok(!useNgrok);
    switchApiUrl(!useNgrok);
    setResponse(null);
    setError(null);
  };

  // Test the login API directly
  const testLoginApi = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const apiUrl = `${getApiUrl()}/login`;
      console.log(`Testing API: ${apiUrl}`);
      console.log(`Credentials: ${email} / ${password.replace(/./g, '*')}`);

      const response = await axios.post(apiUrl, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('API Response:', response.data);
      setResponse(response.data);
    } catch (err) {
      console.error('API Error:', err);
      
      let errorMessage = 'Unknown error occurred';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Status: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Test Tool</Text>
        <Text style={styles.subtitle}>
          Current API: {useNgrok ? 'Ngrok' : 'Local'}
        </Text>
        <Text style={styles.apiUrl}>{getApiUrl()}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Test Login API</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button}
            onPress={testLoginApi}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Login</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, useNgrok ? styles.toggleActive : {}]}
            onPress={toggleApiUrl}
          >
            <Text style={styles.toggleText}>
              {useNgrok ? 'Switch to Local' : 'Switch to Ngrok'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.sectionTitle}>Response</Text>
          <View style={styles.jsonContainer}>
            <Text style={styles.jsonText}>
              {JSON.stringify(response, null, 2)}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.sectionTitle}>Error</Text>
          <View style={styles.jsonContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  apiUrl: {
    fontSize: 14,
    color: '#007BFF',
    marginTop: 5,
  },
  form: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleActive: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
  },
  responseContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jsonContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#d32f2f',
  },
});

export default TestApiScreen; 