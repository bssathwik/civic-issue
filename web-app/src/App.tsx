import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import components (we'll create these)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IssuesPage from './pages/IssuesPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import FieldWorkerDashboard from './pages/field-worker/FieldWorkerDashboard';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#FF9800',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <div className="App">
                <Header />
                <main style={{ minHeight: 'calc(100vh - 120px)' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/issues" element={<IssuesPage />} />
                    <Route path="/issues/:id" element={<IssueDetailPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    {/* Protected Routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/report" 
                      element={
                        <ProtectedRoute>
                          <ReportIssuePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Admin Routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Field Worker Routes */}
                    <Route 
                      path="/field-worker/*" 
                      element={
                        <ProtectedRoute allowedRoles={['field_worker', 'admin']}>
                          <FieldWorkerDashboard />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
