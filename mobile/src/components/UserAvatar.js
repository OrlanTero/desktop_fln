import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * UserAvatar component that displays either a user's photo or their initials in a circle
 * 
 * @param {Object} props Component props
 * @param {string} props.name User's name
 * @param {string} props.photoUrl User's photo URL
 * @param {number} props.size Size of the avatar (default: 50)
 * @param {string} props.backgroundColor Background color for initials avatar (default: random color based on name)
 * @param {Object} props.style Additional style for the avatar container
 */
const UserAvatar = ({ name, photoUrl, size = 50, backgroundColor, style }) => {
  // Get initials from name (up to 2 characters)
  const getInitials = (name) => {
    if (!name) return '?';
    
    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length === 0) return '?';
    
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  // Generate a consistent color based on the name
  const getColorFromName = (name) => {
    if (!name) return '#757575'; // Default gray
    
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Simple hash function to get a consistent index
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const initials = getInitials(name);
  const avatarColor = backgroundColor || getColorFromName(name);
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: avatarColor,
    ...style
  };
  
  const textSize = size * 0.4; // Text size proportional to avatar size
  
  return (
    <View style={[styles.container, containerStyle]}>
      {photoUrl ? (
        <Image 
          source={{ uri: photoUrl }} 
          style={styles.image} 
          onError={() => console.log(`Failed to load image for ${name}`)}
        />
      ) : (
        <Text style={[styles.initialsText, { fontSize: textSize }]}>
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default UserAvatar; 