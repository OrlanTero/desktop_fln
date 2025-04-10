import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

/**
 * A wrapper component that handles safe area insets for consistent layout across devices
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.style - Additional styles for the container
 * @param {boolean} props.topInset - Whether to apply top inset padding (default: true)
 * @param {boolean} props.bottomInset - Whether to apply bottom inset padding (default: false)
 * @param {string} props.backgroundColor - Background color for the container (will override theme color if provided)
 * @param {Array} props.edges - Edges to apply safe area to (default: ['top'])
 * @returns {React.ReactNode}
 */
const SafeAreaWrapper = ({
  children,
  style,
  topInset = true,
  bottomInset = false,
  backgroundColor,
  edges = ['top'],
}) => {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Use provided backgroundColor or fall back to theme background color
  const bgColor = backgroundColor || theme.colors.background;

  // Determine which edges to apply safe area to
  const safeAreaEdges = [];
  if (topInset) safeAreaEdges.push('top');
  if (bottomInset) safeAreaEdges.push('bottom');

  // Use SafeAreaView directly for better compatibility
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={[styles.container, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
