import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const SplashScreen = () => {
  return (
    <SafeAreaWrapper backgroundColor="#ffffff" edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>FLN Liaison</Text>
        <Text style={styles.subtitle}>Liaison Portal</Text>
        <ActivityIndicator 
          style={styles.loader} 
          size="large" 
          color="#007BFF" 
        />
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen; 