import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { ReportsProvider } from '../src/context/ReportsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ReportsProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ReportsProvider>
    </AuthProvider>
  );
}
