import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SafeAreaWrapper from './SafeAreaWrapper';

/**
 * A common wrapper for all screens to ensure consistent layout and safe area handling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Screen title (optional)
 * @param {Object} props.style - Additional styles for the container
 * @param {Array} props.edges - Safe area edges to apply (default: ['top'])
 * @param {string} props.backgroundColor - Background color for the screen
 * @returns {React.ReactNode}
 */
const ScreenWrapper = ({ 
  children, 
  title,
  style, 
  edges = ['top'],
  backgroundColor = '#f5f5f5'
}) => {
  return (
    <SafeAreaWrapper edges={edges} backgroundColor={backgroundColor}>
      <View style={[styles.container, style]}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}
        {children}
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ScreenWrapper; 