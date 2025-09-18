import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';

import AboutScreen from '../screens/AboutScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FieldTasksScreen from '../screens/FieldTasksScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import HomeScreen from '../screens/HomeScreen';
import IssueDetailsScreen from '../screens/IssueDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import MapViewScreen from '../screens/MapViewScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RateResolutionScreen from '../screens/RateResolutionScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StartingScreen from '../screens/StartingScreen';
import WorkerScreen from '../screens/WorkerScreen';

const Tab = createBottomTabNavigator();

// Define AppStackParamList type
export type AppStackParamList = {
  StartingScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  MainTabs: undefined;
  ReportIssue: undefined;
  IssueDetails: undefined;
  Feedback: undefined;
  HelpSupport: undefined;
  Settings: undefined;
  AdminDashboard: undefined;
  FieldTasks: undefined;
  Analytics: undefined;
  About: undefined;
  HomeScreen: undefined; // Added HomeScreen
  RateResolution: undefined; // Added RateResolutionScreen
  WorkerScreen: { reportId: number; latitude: number; longitude: number }; // Added latitude and longitude
};

// Ensure LoginScreen uses correct props type
export type LoginScreenProps = StackScreenProps<AppStackParamList, 'LoginScreen'>;

const Stack = createStackNavigator<AppStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapViewScreen} />
      <Tab.Screen name="My Reports" component={MyReportsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StartingScreen" component={StartingScreen} />
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
    <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
    <Stack.Screen name="Feedback" component={FeedbackScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="FieldTasks" component={FieldTasksScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="RateResolution" component={RateResolutionScreen} />
    <Stack.Screen name="WorkerScreen" component={WorkerScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
