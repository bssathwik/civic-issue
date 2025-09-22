import React from 'react';
import { ReportsProvider } from './src/context/ReportsContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  console.log('App is rendering with ReportsProvider wrapping AppNavigator');

  return (
    <AuthProvider>
      <ReportsProvider>
        <AppNavigator />
      </ReportsProvider>
    </AuthProvider>
  );
}