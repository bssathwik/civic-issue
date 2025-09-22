import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Citizen Screens
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import MapViewScreen from '../screens/MapViewScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Worker Screens
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import WorkerIssueDetailsScreen from '../screens/WorkerIssueDetailsScreen';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';
import WorkerMapViewScreen from '../screens/WorkerMapViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Citizen Tab Navigation
const CitizenTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'MyReports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportIssueScreen} 
        options={{ tabBarLabel: 'Report' }}
      />
      <Tab.Screen 
        name="MyReports" 
        component={MyReportsScreen} 
        options={{ tabBarLabel: 'My Reports' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapViewScreen} 
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Worker Tab Navigation
const WorkerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'WorkerMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'WorkerProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={WorkerDashboardScreen} 
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="WorkerMap" 
        component={WorkerMapViewScreen} 
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen 
        name="WorkerProfile" 
        component={WorkerProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator with Role-Based Navigation
const RoleBasedNavigator = () => {
  const { user } = useAuth();

  const isWorker = user?.role === 'worker' || user?.role === 'admin';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isWorker ? (
        <>
          {/* Worker Navigation */}
          <Stack.Screen 
            name="WorkerTabs" 
            component={WorkerTabNavigator} 
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="WorkerIssueDetails" 
            component={WorkerIssueDetailsScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </>
      ) : (
        <>
          {/* Citizen Navigation */}
          <Stack.Screen 
            name="CitizenTabs" 
            component={CitizenTabNavigator}
            options={{ gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RoleBasedNavigator;
