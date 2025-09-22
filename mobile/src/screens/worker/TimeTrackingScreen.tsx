import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TimeTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTaskTime, setCurrentTaskTime] = useState('02:15:30');
  const [todayTotal, setTodayTotal] = useState('06:45:20');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Time Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Task</Text>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{currentTaskTime}</Text>
          <Text style={styles.timeLabel}>Pothole Repair - Main Street</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.trackButton, isTracking ? styles.stopButton : styles.startButton]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Ionicons 
            name={isTracking ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.trackButtonText}>
            {isTracking ? 'Pause Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>
        <View style={styles.summaryCard}>
          <Ionicons name="time" size={32} color="#007AFF" />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTime}>{todayTotal}</Text>
            <Text style={styles.summaryLabel}>Total Hours Worked</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  summaryInfo: {
    marginLeft: 15,
  },
  summaryTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default TimeTrackingScreen;
