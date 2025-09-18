import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface IconSymbolProps {
  size: number;
  name: string;
  color: string;
}

export const IconSymbol: React.FC<IconSymbolProps> = ({ size, name, color }) => {
  return (
    <View>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  );
};
