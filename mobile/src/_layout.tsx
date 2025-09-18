import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from './components/haptic-tab';
import { IconSymbol } from './components/ui/icon-symbol';
import { Colors } from './constants/theme';
import { useColorScheme } from './hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="StartingScreen"
        options={{
          title: 'Start',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="LoginScreen"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="RegisterScreen"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="user-plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="home" color={color} />,
        }}
      />
    </Tabs>
  );
}
