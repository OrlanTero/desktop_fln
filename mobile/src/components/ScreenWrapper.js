import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SafeAreaWrapper from './SafeAreaWrapper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

/**
 * A common wrapper for all screens to ensure consistent layout and safe area handling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Screen title (optional)
 * @param {Object} props.style - Additional styles for the container
 * @param {Array} props.edges - Safe area edges to apply (default: ['top'])
 * @param {string} props.backgroundColor - Background color for the screen (will override theme color if provided)
 * @param {boolean} props.showBackButton - Whether to show a back button
 * @param {Function} props.onBackPress - Function to call when back button is pressed
 * @returns {React.ReactNode}
 */
const ScreenWrapper = ({
  children,
  title,
  style,
  edges = ['top'],
  backgroundColor,
  showBackButton = false,
  onBackPress,
}) => {
  const { theme } = useTheme();

  // Use provided backgroundColor or fall back to theme background color
  const bgColor = backgroundColor || theme.colors.background;

  return (
    <SafeAreaWrapper edges={edges} backgroundColor={bgColor}>
      <View style={[styles.container, style]}>
        {title && (
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            {showBackButton && (
              <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            <Text
              style={[
                styles.headerTitle,
                showBackButton && styles.headerTitleWithBack,
                { color: theme.colors.text },
              ]}
            >
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
    padding: 15,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleWithBack: {
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
});

export default ScreenWrapper;
