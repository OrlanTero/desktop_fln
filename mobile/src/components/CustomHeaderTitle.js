import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomHeaderTitle = ({ children }) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.headerTitle,
        {
          color: theme.colors.text,
        },
      ]}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomHeaderTitle;
