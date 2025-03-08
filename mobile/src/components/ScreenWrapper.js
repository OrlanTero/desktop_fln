import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SafeAreaWrapper from './SafeAreaWrapper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * A common wrapper for all screens to ensure consistent layout and safe area handling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Screen title (optional)
 * @param {Object} props.style - Additional styles for the container
 * @param {Array} props.edges - Safe area edges to apply (default: ['top'])
 * @param {string} props.backgroundColor - Background color for the screen
 * @param {boolean} props.showBackButton - Whether to show a back button
 * @param {Function} props.onBackPress - Function to call when back button is pressed
 * @returns {React.ReactNode}
 */
const ScreenWrapper = ({ 
  children, 
  title,
  style, 
  edges = ['top'],
  backgroundColor = '#f5f5f5',
  showBackButton = false,
  onBackPress
}) => {
  return (
    <SafeAreaWrapper edges={edges} backgroundColor={backgroundColor}>
      <View style={[styles.container, style]}>
        {title && (
          <View style={styles.header}>
            {showBackButton && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <Text style={[
              styles.headerTitle,
              showBackButton && styles.headerTitleWithBack
            ]}>
              {title}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleWithBack: {
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  }
});

export default ScreenWrapper; 