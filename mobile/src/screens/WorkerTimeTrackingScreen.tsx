import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface TimeEntry {
  id: string;
  issueId: number;
  issueTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  status: 'active' | 'paused' | 'completed';
  breakTime: number; // in minutes
  description?: string;
  category: 'work' | 'travel' | 'break' | 'documentation';
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface WorkSession {
  id: string;
  date: Date;
  shiftStart: Date;
  shiftEnd?: Date;
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  issuesCompleted: number;
  entries: TimeEntry[];
}

interface TimeStats {
  today: {
    workTime: number;
    breakTime: number;
    issuesCompleted: number;
    efficiency: number; // percentage
  };
  thisWeek: {
    workTime: number;
    averageDaily: number;
    issuesCompleted: number;
    daysWorked: number;
  };
  thisMonth: {
    workTime: number;
    averageDaily: number;
    issuesCompleted: number;
    daysWorked: number;
  };
}

// Mock data
const MOCK_SESSIONS: WorkSession[] = [
  {
    id: '1',
    date: new Date(),
    shiftStart: new Date(Date.now() - 7200000), // 2 hours ago
    totalWorkTime: 105,
    totalBreakTime: 15,
    issuesCompleted: 3,
    entries: [
      {
        id: '1',
        issueId: 123,
        issueTitle: 'Fix pothole on Main Street',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 5400000),
        duration: 30,
        status: 'completed',
        breakTime: 5,
        category: 'work',
        description: 'Repaired large pothole, applied new asphalt',
      },
      {
        id: '2',
        issueId: 124,
        issueTitle: 'Replace broken street light',
        startTime: new Date(Date.now() - 5400000),
        endTime: new Date(Date.now() - 3600000),
        duration: 25,
        status: 'completed',
        breakTime: 0,
        category: 'work',
      },
    ],
  },
];

const MOCK_STATS: TimeStats = {
  today: {
    workTime: 105, // 1h 45m
    breakTime: 15,
    issuesCompleted: 3,
    efficiency: 87.5,
  },
  thisWeek: {
    workTime: 2100, // 35 hours
    averageDaily: 420, // 7 hours
    issuesCompleted: 15,
    daysWorked: 5,
  },
  thisMonth: {
    workTime: 8400, // 140 hours
    averageDaily: 384, // 6.4 hours
    issuesCompleted: 67,
    daysWorked: 22,
  },
};

const WorkerTimeTrackingScreen = () => {
  // State management
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [timeStats, setTimeStats] = useState<TimeStats>({
    today: { workTime: 0, breakTime: 0, issuesCompleted: 0, efficiency: 0 },
    thisWeek: { workTime: 0, averageDaily: 0, issuesCompleted: 0, daysWorked: 0 },
    thisMonth: { workTime: 0, averageDaily: 0, issuesCompleted: 0, daysWorked: 0 },
  });
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadTimeData = useCallback(async () => {
    try {
      // TODO: Replace with actual API calls
      // const sessionsResponse = await apiClient.get('/worker/time-sessions');
      // const statsResponse = await apiClient.get('/worker/time-stats');
      // setSessions(sessionsResponse.data);
      // setTimeStats(statsResponse.data);
      
      // Using mock data
      setSessions(MOCK_SESSIONS);
      setTimeStats(MOCK_STATS);
    } catch (error) {
      console.error('Failed to load time data:', error);
      Alert.alert('Error', 'Failed to load time tracking data');
    }
  }, []);

  useEffect(() => {
    loadTimeData();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [loadTimeData]);

  const startShift = async () => {
    try {
      const now = new Date();
      setIsShiftActive(true);
      setShiftStartTime(now);
      
      // TODO: Start shift on server
      // await apiClient.post('/worker/shift/start', { startTime: now });
      
      Alert.alert('Shift Started', 'Your work shift has been started. Good luck today!');
    } catch (error) {
      console.error('Failed to start shift:', error);
      Alert.alert('Error', 'Failed to start shift');
    }
  };

  const endShift = async () => {
    if (!shiftStartTime) return;
    
    Alert.alert(
      'End Shift',
      'Are you sure you want to end your shift? This will stop all active time tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Shift',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsShiftActive(false);
              setShiftStartTime(null);
              if (currentEntry) {
                await stopTimer();
              }
              
              // TODO: End shift on server
              // await apiClient.post('/worker/shift/end', { endTime: new Date() });
              
              Alert.alert('Shift Ended', 'Your shift has been completed. Great work today!');
            } catch (error) {
              console.error('Failed to end shift:', error);
              Alert.alert('Error', 'Failed to end shift');
            }
          },
        },
      ]
    );
  };

  const startTimer = async (issueId: number, issueTitle: string, category: TimeEntry['category'] = 'work') => {
    if (!isShiftActive) {
      Alert.alert('Shift Not Started', 'Please start your shift first to begin time tracking.');
      return;
    }

    if (currentEntry) {
      Alert.alert('Timer Active', 'Please stop the current timer before starting a new one.');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      issueId,
      issueTitle,
      startTime: new Date(),
      duration: 0,
      status: 'active',
      breakTime: 0,
      category,
    };

    setCurrentEntry(newEntry);
    
    // TODO: Start timer on server
    // await apiClient.post('/worker/time-entry/start', newEntry);
    
    Alert.alert('Timer Started', `Started tracking time for: ${issueTitle}`);
  };

  const stopTimer = async () => {
    if (!currentEntry) return;

    const now = new Date();
    const duration = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 60000);
    
    const completedEntry: TimeEntry = {
      ...currentEntry,
      endTime: now,
      duration,
      status: 'completed',
    };

    // Add to current session
    setSessions(prev => {
      const today = prev.find(s => 
        s.date.toDateString() === new Date().toDateString()
      );
      
      if (today) {
        return prev.map(s => 
          s.id === today.id 
            ? { ...s, entries: [...s.entries, completedEntry] }
            : s
        );
      } else {
        const newSession: WorkSession = {
          id: Date.now().toString(),
          date: new Date(),
          shiftStart: shiftStartTime || new Date(),
          totalWorkTime: duration,
          totalBreakTime: 0,
          issuesCompleted: 1,
          entries: [completedEntry],
        };
        return [newSession, ...prev];
      }
    });

    setCurrentEntry(null);
    
    // TODO: Stop timer on server
    // await apiClient.post('/worker/time-entry/stop', { entryId: currentEntry.id });
    
    Alert.alert('Timer Stopped', `Logged ${formatDuration(duration)} for: ${currentEntry.issueTitle}`);
  };

  const pauseTimer = () => {
    if (!currentEntry) return;
    
    setCurrentEntry(prev => prev ? { ...prev, status: 'paused' } : null);
    Alert.alert('Timer Paused', 'Time tracking has been paused');
  };

  const resumeTimer = () => {
    if (!currentEntry) return;
    
    setCurrentEntry(prev => prev ? { ...prev, status: 'active' } : null);
    Alert.alert('Timer Resumed', 'Time tracking has been resumed');
  };

  const addBreakTime = (minutes: number) => {
    if (!currentEntry) return;
    
    setCurrentEntry(prev => prev ? { 
      ...prev, 
      breakTime: prev.breakTime + minutes 
    } : null);
    
    Alert.alert('Break Added', `Added ${minutes} minute break`);
  };

  const getCurrentDuration = (): number => {
    if (!currentEntry || currentEntry.status === 'paused') return currentEntry?.duration || 0;
    
    const elapsed = Math.floor((currentTime.getTime() - currentEntry.startTime.getTime()) / 60000);
    return elapsed;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 80) return '#10B981';
    if (efficiency >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTimeData();
    setRefreshing(false);
  }, [loadTimeData]);

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => {
        setSelectedEntry(item);
        setDetailsModalVisible(true);
      }}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryIcon}>
          <Ionicons 
            name={
              item.category === 'work' ? 'construct' :
              item.category === 'travel' ? 'car' :
              item.category === 'break' ? 'cafe' : 'document'
            } 
            size={20} 
            color="#6366F1" 
          />
        </View>
        
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle}>{item.issueTitle}</Text>
          <Text style={styles.entryTime}>
            {formatTime(item.startTime)} - {item.endTime ? formatTime(item.endTime) : 'Active'}
          </Text>
        </View>
        
        <View style={styles.entryMeta}>
          <Text style={styles.entryDuration}>{formatDuration(item.duration)}</Text>
          <View style={[
            styles.entryStatus,
            { backgroundColor: item.status === 'active' ? '#10B981' : '#6B7280' }
          ]}>
            <Text style={styles.entryStatusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = (title: string, stats: any) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>{title}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(stats.workTime)}</Text>
          <Text style={styles.statLabel}>Work Time</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.issuesCompleted}</Text>
          <Text style={styles.statLabel}>Issues</Text>
        </View>
        
        {stats.efficiency && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getEfficiencyColor(stats.efficiency) }]}>
              {stats.efficiency}%
            </Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
        )}
        
        {stats.averageDaily && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(stats.averageDaily)}</Text>
            <Text style={styles.statLabel}>Daily Avg</Text>
          </View>
        )}
      </View>
    </View>
  );

  const todaySession = sessions.find(s => s.date.toDateString() === new Date().toDateString());

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Time Tracking</Text>
          <Text style={styles.headerSubtitle}>
            {isShiftActive 
              ? `Shift: ${shiftStartTime ? formatTime(shiftStartTime) : ''} - Active`
              : 'Shift not started'
            }
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.shiftButton, { backgroundColor: isShiftActive ? '#EF4444' : '#10B981' }]}
          onPress={isShiftActive ? endShift : startShift}
        >
          <Ionicons 
            name={isShiftActive ? 'stop' : 'play'} 
            size={20} 
            color="#FFF" 
          />
          <Text style={styles.shiftButtonText}>
            {isShiftActive ? 'End Shift' : 'Start Shift'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Timer */}
        {currentEntry && (
          <View style={styles.currentTimer}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerTitle}>Current Task</Text>
              <View style={styles.timerControls}>
                {currentEntry.status === 'active' ? (
                  <TouchableOpacity style={styles.timerButton} onPress={pauseTimer}>
                    <Ionicons name="pause" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.timerButton} onPress={resumeTimer}>
                    <Ionicons name="play" size={20} color="#10B981" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.timerButton} onPress={stopTimer}>
                  <Ionicons name="stop" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.timerTask}>{currentEntry.issueTitle}</Text>
            <Text style={styles.timerDuration}>
              {formatDuration(getCurrentDuration())}
            </Text>
            
            <View style={styles.breakControls}>
              <Text style={styles.breakLabel}>Quick Break:</Text>
              <View style={styles.breakButtons}>
                {[5, 10, 15].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={styles.breakButton}
                    onPress={() => addBreakTime(minutes)}
                  >
                    <Text style={styles.breakButtonText}>{minutes}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, !isShiftActive && styles.actionButtonDisabled]}
            onPress={() => startTimer(999, 'General Work', 'work')}
            disabled={!isShiftActive}
          >
            <Ionicons name="play" size={24} color={isShiftActive ? '#6366F1' : '#9CA3AF'} />
            <Text style={[styles.actionText, !isShiftActive && styles.actionTextDisabled]}>
              Start Work
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, !isShiftActive && styles.actionButtonDisabled]}
            onPress={() => startTimer(998, 'Travel Time', 'travel')}
            disabled={!isShiftActive}
          >
            <Ionicons name="car" size={24} color={isShiftActive ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.actionText, !isShiftActive && styles.actionTextDisabled]}>
              Travel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, !isShiftActive && styles.actionButtonDisabled]}
            onPress={() => startTimer(997, 'Documentation', 'documentation')}
            disabled={!isShiftActive}
          >
            <Ionicons name="document" size={24} color={isShiftActive ? '#F59E0B' : '#9CA3AF'} />
            <Text style={[styles.actionText, !isShiftActive && styles.actionTextDisabled]}>
              Document
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStatsCard('Today', timeStats.today)}
        {renderStatsCard('This Week', timeStats.thisWeek)}
        {renderStatsCard('This Month', timeStats.thisMonth)}

        {/* Today's Entries */}
        {todaySession && todaySession.entries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>Today&apos;s Activity</Text>
            {todaySession.entries.map(entry => renderTimeEntry({ item: entry }))}
          </View>
        )}
      </ScrollView>

      {/* Entry Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            {selectedEntry && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Time Entry Details</Text>
                  <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <Text style={styles.modalTaskTitle}>{selectedEntry.issueTitle}</Text>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>
                        Duration: {formatDuration(selectedEntry.duration)}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="calendar" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>
                        {formatTime(selectedEntry.startTime)} - {selectedEntry.endTime ? formatTime(selectedEntry.endTime) : 'Active'}
                      </Text>
                    </View>
                    
                    {selectedEntry.breakTime > 0 && (
                      <View style={styles.modalDetailRow}>
                        <Ionicons name="cafe" size={16} color="#6B7280" />
                        <Text style={styles.modalDetailText}>
                          Break: {formatDuration(selectedEntry.breakTime)}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="pricetag" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>
                        Category: {selectedEntry.category}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedEntry.description && (
                    <View style={styles.modalDescription}>
                      <Text style={styles.modalDescriptionTitle}>Notes:</Text>
                      <Text style={styles.modalDescriptionText}>{selectedEntry.description}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
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
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  shiftButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  currentTimer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  timerButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
  },
  timerTask: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  timerDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    textAlign: 'center',
    marginBottom: 16,
  },
  breakControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  breakButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  breakButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  actionTextDisabled: {
    color: '#9CA3AF',
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  entriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  entryItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  entryMeta: {
    alignItems: 'flex-end',
  },
  entryDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  entryStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  entryStatusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  modalTaskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  modalDetails: {
    gap: 12,
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalDescription: {
    marginTop: 8,
  },
  modalDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default WorkerTimeTrackingScreen;
