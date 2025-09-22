import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface OfflineAction {
  id: string;
  type: 'update_status' | 'add_comment' | 'upload_photo' | 'complete_issue' | 'start_work' | 'end_work';
  issueId?: number;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingActions: number;
  syncInProgress: boolean;
  syncErrors: number;
}

interface OfflineData {
  issues: any[];
  photos: { [key: string]: string }; // base64 encoded photos
  userProfile: any;
  workSessions: any[];
  lastDataFetch: Date;
}

interface StorageUsage {
  total: number; // MB
  issues: number;
  photos: number;
  cache: number;
  available: number;
}

const WorkerOfflineModeScreen = () => {
  // State management
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    pendingActions: 0,
    syncInProgress: false,
    syncErrors: 0,
  });
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    issues: [],
    photos: {},
    userProfile: null,
    workSessions: [],
    lastDataFetch: new Date(),
  });
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    total: 0,
    issues: 0,
    photos: 0,
    cache: 0,
    available: 100,
  });
  const [settings, setSettings] = useState({
    autoSync: true,
    downloadPhotos: true,
    maxStorageSize: 500, // MB
    syncOnWiFiOnly: false,
    preloadNearbyIssues: true,
    offlineMapsEnabled: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeOfflineMode();
    checkNetworkStatus();
    loadOfflineData();
    calculateStorageUsage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkNetworkStatus();
      if (settings.autoSync && syncStatus.isOnline && !syncStatus.syncInProgress) {
        syncPendingActions();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoSync, syncStatus.isOnline, syncStatus.syncInProgress]);

  const initializeOfflineMode = useCallback(async () => {
    try {
      // Load offline settings
      const savedSettings = await AsyncStorage.getItem('offlineSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Load pending actions
      const savedActions = await AsyncStorage.getItem('pendingActions');
      if (savedActions) {
        setOfflineActions(JSON.parse(savedActions));
      }
    } catch (error) {
      console.error('Failed to initialize offline mode:', error);
    }
  }, []);

  const checkNetworkStatus = useCallback(async () => {
    try {
      // TODO: Use actual network status check
      // const netInfo = await NetInfo.fetch();
      // const isConnected = netInfo.isConnected && netInfo.isInternetReachable;
      
      // Mock network check
      const isConnected = Math.random() > 0.3; // Simulate intermittent connectivity
      
      setSyncStatus(prev => ({
        ...prev,
        isOnline: isConnected,
      }));
    } catch (error) {
      console.error('Failed to check network status:', error);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    }
  }, []);

  const loadOfflineData = useCallback(async () => {
    try {
      const cachedIssues = await AsyncStorage.getItem('cachedIssues');
      const cachedPhotos = await AsyncStorage.getItem('cachedPhotos');
      const cachedProfile = await AsyncStorage.getItem('cachedProfile');
      const cachedSessions = await AsyncStorage.getItem('cachedWorkSessions');

      setOfflineData({
        issues: cachedIssues ? JSON.parse(cachedIssues) : [],
        photos: cachedPhotos ? JSON.parse(cachedPhotos) : {},
        userProfile: cachedProfile ? JSON.parse(cachedProfile) : null,
        workSessions: cachedSessions ? JSON.parse(cachedSessions) : [],
        lastDataFetch: new Date(),
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  const calculateStorageUsage = useCallback(async () => {
    try {
      // TODO: Implement actual storage calculation
      // This would calculate the actual size of stored data
      const mockUsage: StorageUsage = {
        total: 45.7,
        issues: 12.3,
        photos: 28.9,
        cache: 4.5,
        available: 454.3,
      };

      setStorageUsage(mockUsage);
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (syncStatus.syncInProgress || offlineActions.length === 0) return;

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const action of offlineActions) {
        if (action.status === 'synced') continue;

        try {
          // TODO: Implement actual API calls for each action type
          // await apiClient.post(`/worker/offline/sync/${action.type}`, action.data);
          
          // Mock sync success (90% success rate)
          if (Math.random() > 0.1) {
            action.status = 'synced';
            successCount++;
          } else {
            action.retryCount++;
            if (action.retryCount >= action.maxRetries) {
              action.status = 'failed';
              errorCount++;
            } else {
              action.status = 'pending';
            }
          }
        } catch {
          action.retryCount++;
          if (action.retryCount >= action.maxRetries) {
            action.status = 'failed';
            errorCount++;
          }
        }
      }

      // Update pending actions
      setOfflineActions([...offlineActions]);
      await AsyncStorage.setItem('pendingActions', JSON.stringify(offlineActions));

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingActions: offlineActions.filter(a => a.status === 'pending').length,
        syncErrors: errorCount,
        syncInProgress: false,
      }));

      if (successCount > 0) {
        Alert.alert('Sync Complete', `Successfully synced ${successCount} actions`);
      }
      if (errorCount > 0) {
        Alert.alert('Sync Errors', `${errorCount} actions failed to sync`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
      Alert.alert('Sync Failed', 'Unable to sync offline actions');
    }
  }, [syncStatus.syncInProgress, offlineActions]);

  const downloadOfflineData = useCallback(async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('No Connection', 'Internet connection required to download data');
      return;
    }

    try {
      setRefreshing(true);

      // TODO: Download actual data from API
      // const issuesResponse = await apiClient.get('/worker/issues/nearby');
      // const profileResponse = await apiClient.get('/worker/profile');
      
      // Mock download
      const mockIssues = [
        { id: 1, title: 'Pothole on Main St', status: 'assigned', priority: 'high' },
        { id: 2, title: 'Broken Street Light', status: 'in_progress', priority: 'medium' },
      ];

      await AsyncStorage.setItem('cachedIssues', JSON.stringify(mockIssues));
      await AsyncStorage.setItem('lastDataFetch', new Date().toISOString());

      setOfflineData(prev => ({
        ...prev,
        issues: mockIssues,
        lastDataFetch: new Date(),
      }));

      Alert.alert('Download Complete', 'Offline data has been updated');
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', 'Unable to download offline data');
    } finally {
      setRefreshing(false);
    }
  }, [syncStatus.isOnline]);

  const clearOfflineData = useCallback(async () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all cached issues, photos, and offline data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'cachedIssues',
                'cachedPhotos',
                'cachedProfile',
                'cachedWorkSessions',
              ]);

              setOfflineData({
                issues: [],
                photos: {},
                userProfile: null,
                workSessions: [],
                lastDataFetch: new Date(),
              });

              calculateStorageUsage();
              Alert.alert('Success', 'Offline data cleared');
            } catch {
              Alert.alert('Error', 'Failed to clear offline data');
            }
          },
        },
      ]
    );
  }, [calculateStorageUsage]);

  const retryFailedActions = useCallback(async () => {
    const failedActions = offlineActions.filter(a => a.status === 'failed');
    
    if (failedActions.length === 0) {
      Alert.alert('No Failed Actions', 'All actions have been synced successfully');
      return;
    }

    // Reset failed actions to pending
    const updatedActions = offlineActions.map(action => 
      action.status === 'failed' 
        ? { ...action, status: 'pending' as const, retryCount: 0 }
        : action
    );

    setOfflineActions(updatedActions);
    await AsyncStorage.setItem('pendingActions', JSON.stringify(updatedActions));

    if (syncStatus.isOnline) {
      syncPendingActions();
    }
  }, [offlineActions, syncStatus.isOnline, syncPendingActions]);

  const updateSetting = useCallback(async (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('offlineSettings', JSON.stringify(newSettings));
  }, [settings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkNetworkStatus();
    await calculateStorageUsage();
    setRefreshing(false);
  }, [checkNetworkStatus, calculateStorageUsage]);

  const getActionIcon = (type: OfflineAction['type']) => {
    switch (type) {
      case 'update_status': return 'refresh';
      case 'add_comment': return 'chatbubble';
      case 'upload_photo': return 'camera';
      case 'complete_issue': return 'checkmark-circle';
      case 'start_work': return 'play';
      case 'end_work': return 'stop';
      default: return 'document';
    }
  };

  const getStatusColor = (status: OfflineAction['status']) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'syncing': return '#3B82F6';
      case 'synced': return '#10B981';
      case 'failed': return '#EF4444';
    }
  };

  const renderActionItem = (action: OfflineAction) => (
    <View key={action.id} style={styles.actionItem}>
      <View style={[styles.actionIcon, { backgroundColor: getStatusColor(action.status) }]}>
        <Ionicons name={getActionIcon(action.type) as any} size={20} color="#FFF" />
      </View>
      
      <View style={styles.actionContent}>
        <Text style={styles.actionType}>
          {action.type.replace('_', ' ').toUpperCase()}
        </Text>
        {action.issueId && (
          <Text style={styles.actionIssue}>Issue #{action.issueId}</Text>
        )}
        <Text style={styles.actionTime}>
          {action.timestamp.toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.actionStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(action.status) }]}>
          {action.status.toUpperCase()}
        </Text>
        {action.retryCount > 0 && (
          <Text style={styles.retryText}>
            Retry {action.retryCount}/{action.maxRetries}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStorageBar = (usage: number, total: number, color: string) => {
    const percentage = (usage / total) * 100;
    return (
      <View style={styles.storageBar}>
        <View
          style={[
            styles.storageBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Offline Mode</Text>
          <View style={[styles.statusIndicator, syncStatus.isOnline ? styles.online : styles.offline]}>
            <Ionicons 
              name={syncStatus.isOnline ? "wifi" : "wifi-outline"} 
              size={16} 
              color="#FFF" 
            />
            <Text style={styles.statusText}>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncPendingActions}
          disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
        >
          <Ionicons 
            name={syncStatus.syncInProgress ? "sync" : "refresh"} 
            size={20} 
            color="#FFF" 
          />
          <Text style={styles.syncButtonText}>
            {syncStatus.syncInProgress ? 'Syncing...' : 'Sync'}
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
        {/* Sync Status Card */}
        <View style={styles.syncCard}>
          <Text style={styles.cardTitle}>Sync Status</Text>
          
          <View style={styles.syncStats}>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{offlineActions.filter(a => a.status === 'pending').length}</Text>
              <Text style={styles.syncStatLabel}>Pending Actions</Text>
            </View>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>
                {syncStatus.lastSync ? syncStatus.lastSync.toLocaleDateString() : 'Never'}
              </Text>
              <Text style={styles.syncStatLabel}>Last Sync</Text>
            </View>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{syncStatus.syncErrors}</Text>
              <Text style={styles.syncStatLabel}>Failed</Text>
            </View>
          </View>
          
          {syncStatus.syncErrors > 0 && (
            <TouchableOpacity style={styles.retryButton} onPress={retryFailedActions}>
              <Ionicons name="refresh" size={16} color="#EF4444" />
              <Text style={styles.retryButtonText}>Retry Failed Actions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Storage Usage Card */}
        <View style={styles.storageCard}>
          <Text style={styles.cardTitle}>Storage Usage</Text>
          
          <View style={styles.storageOverview}>
            <Text style={styles.storageTotal}>
              {storageUsage.total.toFixed(1)} MB used of {settings.maxStorageSize} MB limit
            </Text>
            {renderStorageBar(storageUsage.total, settings.maxStorageSize, '#6366F1')}
          </View>
          
          <View style={styles.storageBreakdown}>
            <View style={styles.storageItem}>
              <View style={[styles.storageDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.storageItemLabel}>Issues: {storageUsage.issues.toFixed(1)} MB</Text>
            </View>
            <View style={styles.storageItem}>
              <View style={[styles.storageDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.storageItemLabel}>Photos: {storageUsage.photos.toFixed(1)} MB</Text>
            </View>
            <View style={styles.storageItem}>
              <View style={[styles.storageDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.storageItemLabel}>Cache: {storageUsage.cache.toFixed(1)} MB</Text>
            </View>
          </View>
        </View>

        {/* Offline Data Card */}
        <View style={styles.dataCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Offline Data</Text>
            <Text style={styles.lastUpdate}>
              Updated: {offlineData.lastDataFetch.toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.dataStats}>
            <View style={styles.dataStat}>
              <Ionicons name="list" size={24} color="#6366F1" />
              <Text style={styles.dataStatValue}>{offlineData.issues.length}</Text>
              <Text style={styles.dataStatLabel}>Issues</Text>
            </View>
            <View style={styles.dataStat}>
              <Ionicons name="camera" size={24} color="#6366F1" />
              <Text style={styles.dataStatValue}>{Object.keys(offlineData.photos).length}</Text>
              <Text style={styles.dataStatLabel}>Photos</Text>
            </View>
            <View style={styles.dataStat}>
              <Ionicons name="time" size={24} color="#6366F1" />
              <Text style={styles.dataStatValue}>{offlineData.workSessions.length}</Text>
              <Text style={styles.dataStatLabel}>Sessions</Text>
            </View>
          </View>
          
          <View style={styles.dataActions}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={downloadOfflineData}
              disabled={!syncStatus.isOnline}
            >
              <Ionicons name="download" size={16} color="#6366F1" />
              <Text style={styles.downloadButtonText}>Update Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearOfflineData}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
              <Text style={styles.clearButtonText}>Clear Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Offline Settings</Text>
          
          <View style={styles.settingsList}>
            {[
              {
                key: 'autoSync',
                label: 'Auto Sync',
                description: 'Automatically sync when online',
                type: 'switch',
              },
              {
                key: 'downloadPhotos',
                label: 'Download Photos',
                description: 'Cache issue photos for offline viewing',
                type: 'switch',
              },
              {
                key: 'syncOnWiFiOnly',
                label: 'WiFi Only',
                description: 'Only sync when connected to WiFi',
                type: 'switch',
              },
              {
                key: 'preloadNearbyIssues',
                label: 'Preload Nearby Issues',
                description: 'Download issues in your work area',
                type: 'switch',
              },
              {
                key: 'offlineMapsEnabled',
                label: 'Offline Maps',
                description: 'Enable offline map data',
                type: 'switch',
              },
            ].map((setting) => (
              <View key={setting.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={settings[setting.key as keyof typeof settings] as boolean}
                  onValueChange={(value) => updateSetting(setting.key as any, value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                  thumbColor="#FFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Pending Actions List */}
        {offlineActions.length > 0 && (
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Pending Actions</Text>
            <View style={styles.actionsList}>
              {offlineActions
                .filter(action => action.status !== 'synced')
                .slice(0, 5)
                .map(renderActionItem)}
            </View>
            
            {offlineActions.filter(a => a.status !== 'synced').length > 5 && (
              <Text style={styles.moreActionsText}>
                +{offlineActions.filter(a => a.status !== 'synced').length - 5} more actions
              </Text>
            )}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  online: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  offline: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  syncButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  syncCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  syncStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncStat: {
    alignItems: 'center',
  },
  syncStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  syncStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 6,
  },
  retryButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  storageCard: {
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
  storageOverview: {
    marginBottom: 16,
  },
  storageTotal: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageBreakdown: {
    gap: 8,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  storageItemLabel: {
    fontSize: 14,
    color: '#374151',
  },
  dataCard: {
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
  dataStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dataStat: {
    alignItems: 'center',
  },
  dataStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  dataStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  dataActions: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#FFF',
    gap: 6,
  },
  downloadButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFF',
    gap: 6,
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
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
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsCard: {
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
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionIssue: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 2,
  },
  actionTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionStatus: {
    alignItems: 'flex-end',
  },
  retryText: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 2,
  },
  moreActionsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default WorkerOfflineModeScreen;
