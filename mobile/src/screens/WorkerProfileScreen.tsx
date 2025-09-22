import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Types for worker profile and performance data
interface PerformanceMetrics {
  totalIssuesResolved: number;
  avgResolutionTime: number; // in hours
  currentRating: number;
  totalWorkHours: number;
  issuesThisMonth: number;
  efficiency: number; // percentage
}

interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  specialization: string[];
  joinDate: string;
  employeeId: string;
  shift: 'morning' | 'afternoon' | 'night';
  isOnDuty: boolean;
}

const WorkerProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  
  // State management
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState<WorkerProfile | null>(null);
  const [currentShift, setCurrentShift] = useState<Date | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(false);

  // Mock data - will be replaced with API calls
  const mockProfile: WorkerProfile = {
    id: user?._id || '1',
    name: user?.name || 'John Worker',
    email: user?.email || 'john.worker@cityworks.gov',
    phone: '+1 234 567 8900',
    avatar: 'https://via.placeholder.com/120x120/6366F1/FFFFFF?text=JW',
    department: 'Public Works',
    specialization: ['Road Maintenance', 'Electrical', 'Plumbing'],
    joinDate: '2023-01-15',
    employeeId: 'EMP001',
    shift: 'morning',
    isOnDuty: false,
  };

  const mockMetrics: PerformanceMetrics = {
    totalIssuesResolved: 145,
    avgResolutionTime: 2.5,
    currentRating: 4.8,
    totalWorkHours: 1240,
    issuesThisMonth: 23,
    efficiency: 92,
  };

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [profileResponse, metricsResponse] = await Promise.all([
      //   apiClient.get(`/worker/profile/${user._id}`),
      //   apiClient.get(`/worker/metrics/${user._id}`)
      // ]);
      // setProfile(profileResponse.data);
      // setMetrics(metricsResponse.data);
      
      // Using mock data for now
      setTimeout(() => {
        setProfile(mockProfile);
        setMetrics(mockMetrics);
        setIsOnDuty(mockProfile.isOnDuty);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const startShift = async () => {
    try {
      const now = new Date();
      setCurrentShift(now);
      setIsOnDuty(true);
      
      // TODO: API call to start shift
      // await apiClient.post('/worker/shift/start', { startTime: now.toISOString() });
      
      setProfile(prev => prev ? { ...prev, isOnDuty: true } : null);
      Alert.alert('Shift Started', `Your ${profile?.shift} shift started at ${now.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Failed to start shift:', error);
      Alert.alert('Error', 'Failed to start shift');
    }
  };

  const endShift = async () => {
    if (!currentShift) return;
    
    try {
      const endTime = new Date();
      const hoursWorked = Math.round((endTime.getTime() - currentShift.getTime()) / (1000 * 60 * 60) * 10) / 10;
      
      setCurrentShift(null);
      setIsOnDuty(false);
      
      // TODO: API call to end shift
      // await apiClient.post('/worker/shift/end', { 
      //   endTime: endTime.toISOString(),
      //   hoursWorked 
      // });
      
      setProfile(prev => prev ? { ...prev, isOnDuty: false } : null);
      Alert.alert('Shift Ended', `You worked ${hoursWorked} hours today. Great job!`);
    } catch (error) {
      console.error('Failed to end shift:', error);
      Alert.alert('Error', 'Failed to end shift');
    }
  };

  const updateProfile = async () => {
    if (!editedProfile) return;
    
    try {
      // TODO: API call to update profile
      // await apiClient.put('/worker/profile', editedProfile);
      
      setProfile(editedProfile);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditedProfile(profile);
    setEditModalVisible(true);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 3.5) return '#F59E0B';
    return '#EF4444';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#F59E0B" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#F59E0B" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#D1D5DB" />);
    }
    
    return stars;
  };

  if (loading || !profile || !metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
          <Ionicons name="create" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={[styles.statusIndicator, isOnDuty ? styles.onDuty : styles.offDuty]} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profileDepartment}>{profile.department}</Text>
            <Text style={styles.profileId}>ID: {profile.employeeId}</Text>
          </View>
          
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftText}>
              {profile.shift.charAt(0).toUpperCase() + profile.shift.slice(1)} Shift
            </Text>
            <Text style={[styles.statusText, isOnDuty ? styles.onDutyText : styles.offDutyText]}>
              {isOnDuty ? 'On Duty' : 'Off Duty'}
            </Text>
          </View>
        </View>

        {/* Shift Controls */}
        <View style={styles.shiftControls}>
          <TouchableOpacity
            style={[styles.shiftButton, isOnDuty ? styles.endShiftButton : styles.startShiftButton]}
            onPress={isOnDuty ? endShift : startShift}
          >
            <Ionicons 
              name={isOnDuty ? "pause" : "play"} 
              size={20} 
              color="#FFF" 
            />
            <Text style={styles.shiftButtonText}>
              {isOnDuty ? 'End Shift' : 'Start Shift'}
            </Text>
          </TouchableOpacity>
          
          {currentShift && (
            <View style={styles.currentShiftInfo}>
              <Ionicons name="time" size={16} color="#6366F1" />
              <Text style={styles.currentShiftText}>
                Started at {currentShift.toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.metricValue}>{metrics.totalIssuesResolved}</Text>
              </View>
              <Text style={styles.metricLabel}>Issues Resolved</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="time" size={24} color="#6366F1" />
                <Text style={styles.metricValue}>{metrics.avgResolutionTime}h</Text>
              </View>
              <Text style={styles.metricLabel}>Avg Resolution Time</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <View style={styles.ratingContainer}>
                  {renderStars(metrics.currentRating)}
                </View>
                <Text style={[styles.metricValue, { color: getRatingColor(metrics.currentRating) }]}>
                  {metrics.currentRating}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Current Rating</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="trending-up" size={24} color="#F59E0B" />
                <Text style={styles.metricValue}>{metrics.efficiency}%</Text>
              </View>
              <Text style={styles.metricLabel}>Efficiency</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="calendar" size={24} color="#8B5CF6" />
                <Text style={styles.metricValue}>{metrics.issuesThisMonth}</Text>
              </View>
              <Text style={styles.metricLabel}>This Month</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="hourglass" size={24} color="#EF4444" />
                <Text style={styles.metricValue}>{metrics.totalWorkHours}h</Text>
              </View>
              <Text style={styles.metricLabel}>Total Hours</Text>
            </View>
          </View>
        </View>

        {/* Specializations */}
        <View style={styles.specializationsCard}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.specializationsContainer}>
            {profile.specialization.map((spec, index) => (
              <View key={index} style={styles.specializationBadge}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('WorkerReports')}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
            <Text style={styles.actionText}>View Reports</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('WorkerSchedule')}>
            <Ionicons name="calendar" size={24} color="#6366F1" />
            <Text style={styles.actionText}>Schedule</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('WorkerSettings')}>
            <Ionicons name="settings" size={24} color="#6366F1" />
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('WorkerHelp')}>
            <Ionicons name="help-circle" size={24} color="#6366F1" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.name}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, name: text} : null)}
                  placeholder="Enter your name"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.phone}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, phone: text} : null)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Department</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.department}
                  onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, department: text} : null)}
                  placeholder="Enter your department"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  onDuty: {
    backgroundColor: '#10B981',
  },
  offDuty: {
    backgroundColor: '#6B7280',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  shiftInfo: {
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  onDutyText: {
    color: '#10B981',
  },
  offDutyText: {
    color: '#6B7280',
  },
  shiftControls: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  startShiftButton: {
    backgroundColor: '#10B981',
  },
  endShiftButton: {
    backgroundColor: '#EF4444',
  },
  shiftButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentShiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currentShiftText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  metricsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricHeader: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  specializationsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specializationText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  editForm: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default WorkerProfileScreen;
