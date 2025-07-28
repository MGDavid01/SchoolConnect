// src/components/NotificationBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'medium',
  color = '#FF6B35',
}) => {
  if (count === 0) return null;

  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 16, text: 10 };
      case 'large':
        return { container: 24, text: 14 };
      default:
        return { container: 20, text: 12 };
    }
  };

  const { container, text } = getSize();

  return (
    <View
      style={[
        styles.container,
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: text,
            lineHeight: text,
          },
        ]}
      >
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -5,
    right: -5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    minHeight: 16,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge; 