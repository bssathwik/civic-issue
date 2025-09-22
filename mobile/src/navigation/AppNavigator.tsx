import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps, TransitionPresets } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import AboutScreen from '../screens/AboutScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FieldTasksScreen from '../screens/FieldTasksScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import HomeScreen from '../screens/ModernHomeScreen';
import IssueDetailsScreen from '../screens/IssueDetailsScreen';
import LoginScreenModern from '../screens/LoginScreenModern';
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
import EditProfileScreen from '../screens/EditProfileScreen';
import CommunityVotingScreen from '../screens/CommunityVotingScreen';

// Import role-specific screens
import CitizenDashboardScreen from '../screens/CitizenDashboardScreen';
import FieldWorkerDashboardScreen from '../screens/FieldWorkerDashboardScreen';
import AdminDashboard from '../screens/AdminDashboard';
import AssignedIssuesScreen from '../screens/worker/AssignedIssuesScreen';
import IssueManagementScreen from '../screens/worker/IssueManagementScreen';
import TimeTrackingScreen from '../screens/worker/TimeTrackingScreen';
import WorkerReportsScreen from '../screens/worker/WorkerReportsScreen';

import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Define AppStackParamList type
export type AppStackParamList = {
  StartingScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  CitizenDashboard: undefined;
  FieldWorkerDashboard: undefined;
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
  HomeScreen: undefined;
  RateResolution: undefined;
  WorkerScreen: { reportId: number; latitude: number; longitude: number };
  AssignedIssues: undefined;
  IssueManagement: undefined;
  TimeTracking: undefined;
  WorkerReports: undefined;
  EditProfile: undefined;
  CommunityVoting: undefined;
};

// Ensure LoginScreen uses correct props type
export type LoginScreenProps = StackScreenProps<AppStackParamList, 'LoginScreen'>;

const Stack = createStackNavigator<AppStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator 
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'My Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeTabIcon : styles.tabIcon}>
              <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeTabDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : '#FFFFFF',
          borderRadius: 25,
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={80}
              tint="light"
            />
          ) : (
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255, 255, 255, 0.95)']}
              style={StyleSheet.absoluteFill}
            />
          )
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapViewScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="My Reports" 
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Updates',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Tab Navigator for Citizens
const CitizenTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'My Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return (
            <View style={focused ? styles.activeTabIcon : styles.tabIcon}>
              <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeTabDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : '#FFFFFF',
          borderRadius: 25,
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={80}
              tint="light"
            />
          ) : (
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255, 255, 255, 0.95)']}
              style={StyleSheet.absoluteFill}
            />
          )
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapViewScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="My Reports" 
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Tab Navigator for Field Workers
const FieldWorkerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={FieldWorkerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={AssignedIssuesScreen}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapViewScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={WorkerReportsScreen}
        options={{
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Tab Navigator for Administrators
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'ellipse-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9C88FF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen 
        name="Users" 
        component={ProfileScreen} // Temporary, should be UserManagementScreen
        options={{
          tabBarLabel: 'Users',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={AdminDashboardScreen} // Using existing AdminDashboardScreen
        options={{
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // Role-based main component selection
  const getMainComponent = () => {
    if (!user) return MainTabs; // Fallback to original tabs
    
    switch (user.role) {
      case 'field_worker':
        return FieldWorkerTabs;
      case 'citizen':
        return CitizenTabs;
      case 'admin':
        return AdminTabs; // Now using dedicated admin tabs
      default:
        return CitizenTabs; // Default to citizen experience
    }
  };

  const MainComponent = getMainComponent();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens based on user role
        <>
          <Stack.Screen name="MainTabs" component={MainComponent} />
          <Stack.Screen name="CitizenDashboard" component={CitizenDashboardScreen} />
          <Stack.Screen name="FieldWorkerDashboard" component={FieldWorkerDashboardScreen} />
          <Stack.Screen name="AssignedIssues" component={AssignedIssuesScreen} />
          <Stack.Screen name="IssueManagement" component={IssueManagementScreen} />
          <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} />
          <Stack.Screen name="WorkerReports" component={WorkerReportsScreen} />
          <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
          <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="CommunityVoting" component={CommunityVotingScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="FieldTasks" component={FieldTasksScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="RateResolution" component={RateResolutionScreen} />
          <Stack.Screen name="WorkerScreen" component={WorkerScreen} />
        </>
      ) : (
        // Authentication screens
        <>
          <Stack.Screen name="StartingScreen" component={StartingScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreenModern} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeTabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  activeTabDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667eea',
  },
});

export default AppNavigator;
