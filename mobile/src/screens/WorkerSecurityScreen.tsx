import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  Switch,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  sessionTimeout: number; // minutes
  autoLockEnabled: boolean;
  twoFactorEnabled: boolean;
  deviceLockRequired: boolean;
  remoteWipeEnabled: boolean;
  locationTrackingEnabled: boolean;
  auditLogEnabled: boolean;
}

interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  platform: string;
  lastActive: Date;
  location?: string;
  trusted: boolean;
  current: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_attempt' | 'settings_change' | 'biometric_failed' | 'session_expired';
  timestamp: Date;
  device: string;
  location?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SessionInfo {
  startTime: Date;
  lastActivity: Date;
  deviceInfo: string;
  location?: string;
  isActive: boolean;
  timeRemaining: number; // minutes
}

const WorkerSecurityScreen = () => {
  // Mock user context
  // const { user } = useContext(AuthContext);
  
  // State management
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: false,
    pinEnabled: false,
    sessionTimeout: 30,
    autoLockEnabled: true,
    twoFactorEnabled: false,
    deviceLockRequired: true,
    remoteWipeEnabled: false,
    locationTrackingEnabled: true,
    auditLogEnabled: true,
  });
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  // const [availableBiometrics, setAvailableBiometrics] = useState<any[]>([]);
  const [pinSetupModalVisible, setPinSetupModalVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityEventModalVisible, setSecurityEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    initializeSecurity();
    loadSecurityData();
    checkBiometricSupport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSecurity = useCallback(async () => {
    try {
      // Load security settings
      const savedSettings = await AsyncStorage.getItem('securitySettings');
      if (savedSettings) {
        setSecuritySettings(JSON.parse(savedSettings));
      }

      // Initialize session info
      setSessionInfo({
        startTime: new Date(),
        lastActivity: new Date(),
        deviceInfo: 'Mobile Device',
        location: 'Office Location',
        isActive: true,
        timeRemaining: 25, // Mock remaining time
      });
    } catch (error) {
      console.error('Failed to initialize security:', error);
    }
  }, []);

  const loadSecurityData = useCallback(async () => {
    try {
      // Mock devices data
      const mockDevices: DeviceInfo[] = [
        {
          id: '1',
          name: 'iPhone 13 Pro',
          type: 'mobile',
          platform: 'iOS 17.1',
          lastActive: new Date(Date.now() - 300000), // 5 minutes ago
          location: 'Office Building',
          trusted: true,
          current: true,
        },
        {
          id: '2',
          name: 'iPad Air',
          type: 'tablet',
          platform: 'iPadOS 17.1',
          lastActive: new Date(Date.now() - 86400000), // 1 day ago
          location: 'Home',
          trusted: true,
          current: false,
        },
        {
          id: '3',
          name: 'Work Laptop',
          type: 'desktop',
          platform: 'Windows 11',
          lastActive: new Date(Date.now() - 259200000), // 3 days ago
          location: 'Office',
          trusted: false,
          current: false,
        },
      ];

      // Mock security events
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          timestamp: new Date(Date.now() - 300000),
          device: 'iPhone 13 Pro',
          location: 'Office Building',
          details: 'Successful login with biometric authentication',
          severity: 'low',
        },
        {
          id: '2',
          type: 'failed_attempt',
          timestamp: new Date(Date.now() - 3600000),
          device: 'Unknown Device',
          location: 'Remote Location',
          details: 'Failed login attempt with incorrect PIN',
          severity: 'medium',
        },
        {
          id: '3',
          type: 'settings_change',
          timestamp: new Date(Date.now() - 7200000),
          device: 'iPhone 13 Pro',
          location: 'Office Building',
          details: 'Biometric authentication enabled',
          severity: 'low',
        },
        {
          id: '4',
          type: 'biometric_failed',
          timestamp: new Date(Date.now() - 10800000),
          device: 'iPhone 13 Pro',
          location: 'Office Building',
          details: 'Biometric authentication failed - fallback to PIN',
          severity: 'medium',
        },
      ];

      setDevices(mockDevices);
      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }, []);

  const checkBiometricSupport = useCallback(async () => {
    try {
      // TODO: Enable biometric support when expo-local-authentication is available
      // const isSupported = await LocalAuthentication.hasHardwareAsync();
      // const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      // const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Mock biometric support
      const isSupported = true;
      const isEnrolled = true;
      
      setBiometricSupported(isSupported && isEnrolled);
      // setAvailableBiometrics(biometricTypes);
    } catch (error) {
      console.error('Failed to check biometric support:', error);
      setBiometricSupported(false);
    }
  }, []);

  const updateSecuritySetting = useCallback(async (key: keyof SecuritySettings, value: any) => {
    try {
      if (key === 'biometricEnabled' && value && !biometricSupported) {
        Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
        return;
      }

      if (key === 'pinEnabled' && value && !securitySettings.pinEnabled) {
        setPinSetupModalVisible(true);
        return;
      }

      const newSettings = { ...securitySettings, [key]: value };
      setSecuritySettings(newSettings);
      await AsyncStorage.setItem('securitySettings', JSON.stringify(newSettings));

      // Log security event
      const event: SecurityEvent = {
        id: Date.now().toString(),
        type: 'settings_change',
        timestamp: new Date(),
        device: 'Current Device',
        details: `${key} ${value ? 'enabled' : 'disabled'}`,
        severity: 'low',
      };
      setSecurityEvents(prev => [event, ...prev]);
    } catch (error) {
      console.error('Failed to update security setting:', error);
      Alert.alert('Error', 'Failed to update security setting');
    }
  }, [biometricSupported, securitySettings]);

  // const authenticateWithBiometrics = useCallback(async () => {
  //   try {
  //     // TODO: Enable biometric authentication when expo-local-authentication is available
  //     // const result = await LocalAuthentication.authenticateAsync({
  //     //   promptMessage: 'Authenticate to access security settings',
  //     //   cancelLabel: 'Cancel',
  //     //   fallbackLabel: 'Use PIN',
  //     // });

  //     // Mock authentication
  //     const result = { success: true };

  //     if (result.success) {
  //       Alert.alert('Success', 'Biometric authentication successful');
  //       return true;
  //     } else {
  //       Alert.alert('Authentication Failed', 'Biometric authentication failed');
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error('Biometric authentication error:', error);
  //     Alert.alert('Error', 'Biometric authentication error');
  //     return false;
  //   }
  // }, []);

  const setupPin = useCallback(async () => {
    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'New PIN and confirmation do not match');
      return;
    }

    if (newPin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    try {
      // TODO: Store PIN securely (encrypted)
      await AsyncStorage.setItem('userPin', newPin);
      
      const newSettings = { ...securitySettings, pinEnabled: true };
      setSecuritySettings(newSettings);
      await AsyncStorage.setItem('securitySettings', JSON.stringify(newSettings));

      setPinSetupModalVisible(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      Alert.alert('Success', 'PIN has been set successfully');
    } catch (error) {
      console.error('Failed to setup PIN:', error);
      Alert.alert('Error', 'Failed to setup PIN');
    }
  }, [newPin, confirmPin, securitySettings]);

  const removeDevice = useCallback(async (deviceId: string) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device? This will revoke access for this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDevices = devices.filter(d => d.id !== deviceId);
              setDevices(updatedDevices);
              
              // TODO: Call API to revoke device access
              // await apiClient.post(`/worker/security/devices/${deviceId}/revoke`);

              Alert.alert('Success', 'Device removed successfully');
            } catch (error) {
              console.error('Failed to remove device:', error);
              Alert.alert('Error', 'Failed to remove device');
            }
          },
        },
      ]
    );
  }, [devices]);

  const lockAllSessions = useCallback(async () => {
    Alert.alert(
      'Lock All Sessions',
      'This will lock all active sessions on all devices. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock All',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to lock all sessions
              // await apiClient.post('/worker/security/sessions/lock-all');

              Alert.alert('Success', 'All sessions have been locked');
            } catch (error) {
              console.error('Failed to lock sessions:', error);
              Alert.alert('Error', 'Failed to lock sessions');
            }
          },
        },
      ]
    );
  }, []);

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return 'log-in';
      case 'logout': return 'log-out';
      case 'failed_attempt': return 'warning';
      case 'settings_change': return 'settings';
      case 'biometric_failed': return 'finger-print';
      case 'session_expired': return 'time';
      default: return 'alert-circle';
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
    }
  };

  const getDeviceIcon = (type: DeviceInfo['type']) => {
    switch (type) {
      case 'mobile': return 'phone-portrait';
      case 'tablet': return 'tablet-portrait';
      case 'desktop': return 'desktop';
      default: return 'hardware-chip';
    }
  };

  const renderDeviceItem = ({ item }: { item: DeviceInfo }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <View style={styles.deviceIcon}>
          <Ionicons name={getDeviceIcon(item.type) as any} size={24} color="#6366F1" />
        </View>
        
        <View style={styles.deviceDetails}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceName}>{item.name}</Text>
            {item.current && <Text style={styles.currentDevice}>CURRENT</Text>}
            {item.trusted && <Ionicons name="shield-checkmark" size={16} color="#10B981" />}
          </View>
          <Text style={styles.devicePlatform}>{item.platform}</Text>
          <Text style={styles.deviceLastActive}>
            Last active: {item.lastActive.toLocaleString()}
          </Text>
          {item.location && (
            <Text style={styles.deviceLocation}>📍 {item.location}</Text>
          )}
        </View>
      </View>
      
      {!item.current && (
        <TouchableOpacity
          style={styles.removeDeviceButton}
          onPress={() => removeDevice(item.id)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEventItem = ({ item }: { item: SecurityEvent }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => {
        setSelectedEvent(item);
        setSecurityEventModalVisible(true);
      }}
    >
      <View style={[styles.eventIcon, { backgroundColor: getSeverityColor(item.severity) }]}>
        <Ionicons name={getEventIcon(item.type) as any} size={20} color="#FFF" />
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.eventDetails} numberOfLines={2}>{item.details}</Text>
        <Text style={styles.eventTime}>{item.timestamp.toLocaleString()}</Text>
        {item.location && (
          <Text style={styles.eventLocation}>📍 {item.location}</Text>
        )}
      </View>
      
      <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(item.severity) }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security & Authentication</Text>
        <TouchableOpacity style={styles.lockButton} onPress={lockAllSessions}>
          <Ionicons name="lock-closed" size={20} color="#FFF" />
          <Text style={styles.lockButtonText}>Lock All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Info Card */}
        {sessionInfo && (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.cardTitle}>Current Session</Text>
              <View style={styles.sessionStatus}>
                <View style={styles.activeIndicator} />
                <Text style={styles.sessionActiveText}>Active</Text>
              </View>
            </View>
            
            <View style={styles.sessionInfo}>
              <View style={styles.sessionInfoRow}>
                <Text style={styles.sessionInfoLabel}>Started:</Text>
                <Text style={styles.sessionInfoValue}>
                  {sessionInfo.startTime.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.sessionInfoRow}>
                <Text style={styles.sessionInfoLabel}>Last Activity:</Text>
                <Text style={styles.sessionInfoValue}>
                  {sessionInfo.lastActivity.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.sessionInfoRow}>
                <Text style={styles.sessionInfoLabel}>Time Remaining:</Text>
                <Text style={styles.sessionInfoValue}>
                  {sessionInfo.timeRemaining} minutes
                </Text>
              </View>
              {sessionInfo.location && (
                <View style={styles.sessionInfoRow}>
                  <Text style={styles.sessionInfoLabel}>Location:</Text>
                  <Text style={styles.sessionInfoValue}>📍 {sessionInfo.location}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Security Settings Card */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Security Settings</Text>
          
          <View style={styles.settingsList}>
            {[
              {
                key: 'biometricEnabled',
                label: 'Biometric Authentication',
                description: biometricSupported ? 'Use fingerprint or face ID' : 'Not available on this device',
                icon: 'finger-print',
                disabled: !biometricSupported,
              },
              {
                key: 'pinEnabled',
                label: 'PIN Authentication',
                description: 'Require PIN to access app',
                icon: 'keypad',
              },
              {
                key: 'autoLockEnabled',
                label: 'Auto Lock',
                description: 'Lock app when inactive',
                icon: 'lock-closed',
              },
              {
                key: 'twoFactorEnabled',
                label: 'Two-Factor Authentication',
                description: 'Extra security for login',
                icon: 'shield-checkmark',
              },
              {
                key: 'deviceLockRequired',
                label: 'Device Lock Required',
                description: 'Require device to be locked',
                icon: 'phone-portrait',
              },
              {
                key: 'locationTrackingEnabled',
                label: 'Location Tracking',
                description: 'Track location for security',
                icon: 'location',
              },
              {
                key: 'auditLogEnabled',
                label: 'Audit Logging',
                description: 'Log security events',
                icon: 'document-text',
              },
            ].map((setting) => (
              <View key={setting.key} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name={setting.icon as any} size={20} color="#6366F1" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, setting.disabled && styles.disabledText]}>
                    {setting.label}
                  </Text>
                  <Text style={[styles.settingDescription, setting.disabled && styles.disabledText]}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={securitySettings[setting.key as keyof SecuritySettings] as boolean}
                  onValueChange={(value) => updateSecuritySetting(setting.key as any, value)}
                  disabled={setting.disabled}
                  trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                  thumbColor="#FFF"
                />
              </View>
            ))}
          </View>

          {/* Session Timeout Setting */}
          <View style={styles.timeoutSetting}>
            <Text style={styles.timeoutLabel}>Session Timeout</Text>
            <View style={styles.timeoutOptions}>
              {[15, 30, 60, 120].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.timeoutOption,
                    securitySettings.sessionTimeout === minutes && styles.selectedTimeoutOption
                  ]}
                  onPress={() => updateSecuritySetting('sessionTimeout', minutes)}
                >
                  <Text style={[
                    styles.timeoutOptionText,
                    securitySettings.sessionTimeout === minutes && styles.selectedTimeoutOptionText
                  ]}>
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Trusted Devices Card */}
        <View style={styles.devicesCard}>
          <Text style={styles.cardTitle}>Trusted Devices ({devices.length})</Text>
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.deviceSeparator} />}
          />
        </View>

        {/* Security Events Card */}
        <View style={styles.eventsCard}>
          <Text style={styles.cardTitle}>Recent Security Events</Text>
          <FlatList
            data={securityEvents.slice(0, 5)}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.eventSeparator} />}
          />
          
          {securityEvents.length > 5 && (
            <Text style={styles.moreEventsText}>
              +{securityEvents.length - 5} more events
            </Text>
          )}
        </View>

        {/* Emergency Actions Card */}
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitle}>Emergency Actions</Text>
          
          <TouchableOpacity style={styles.emergencyAction}>
            <Ionicons name="refresh" size={20} color="#F59E0B" />
            <Text style={styles.emergencyActionText}>Reset All Passwords</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.emergencyAction}>
            <Ionicons name="ban" size={20} color="#EF4444" />
            <Text style={styles.emergencyActionText}>Revoke All Access</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.emergencyAction}>
            <Ionicons name="trash" size={20} color="#DC2626" />
            <Text style={styles.emergencyActionText}>Remote Wipe Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PIN Setup Modal */}
      <Modal
        visible={pinSetupModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPinSetupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setup PIN</Text>
              <TouchableOpacity onPress={() => setPinSetupModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pinContent}>
              {securitySettings.pinEnabled && (
                <View style={styles.pinField}>
                  <Text style={styles.pinLabel}>Current PIN</Text>
                  <TextInput
                    style={styles.pinInput}
                    value={currentPin}
                    onChangeText={setCurrentPin}
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                    placeholder="Enter current PIN"
                  />
                </View>
              )}
              
              <View style={styles.pinField}>
                <Text style={styles.pinLabel}>New PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={newPin}
                  onChangeText={setNewPin}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="Enter new PIN (4-6 digits)"
                />
              </View>
              
              <View style={styles.pinField}>
                <Text style={styles.pinLabel}>Confirm PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="Confirm new PIN"
                />
              </View>
            </View>
            
            <View style={styles.pinActions}>
              <TouchableOpacity
                style={styles.cancelPinButton}
                onPress={() => setPinSetupModalVisible(false)}
              >
                <Text style={styles.cancelPinButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.setupPinButton} onPress={setupPin}>
                <Text style={styles.setupPinButtonText}>Setup PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        visible={securityEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSecurityEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventModal}>
            {selectedEvent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Security Event Details</Text>
                  <TouchableOpacity onPress={() => setSecurityEventModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.eventModalDetails}>
                  <View style={styles.eventDetailHeader}>
                    <View style={[
                      styles.eventDetailIcon, 
                      { backgroundColor: getSeverityColor(selectedEvent.severity) }
                    ]}>
                      <Ionicons name={getEventIcon(selectedEvent.type) as any} size={24} color="#FFF" />
                    </View>
                    <Text style={styles.eventDetailType}>
                      {selectedEvent.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  
                  <Text style={styles.eventDetailDescription}>{selectedEvent.details}</Text>
                  
                  <View style={styles.eventDetailInfo}>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Timestamp:</Text>
                      <Text style={styles.eventDetailValue}>
                        {selectedEvent.timestamp.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Device:</Text>
                      <Text style={styles.eventDetailValue}>{selectedEvent.device}</Text>
                    </View>
                    {selectedEvent.location && (
                      <View style={styles.eventDetailRow}>
                        <Text style={styles.eventDetailLabel}>Location:</Text>
                        <Text style={styles.eventDetailValue}>📍 {selectedEvent.location}</Text>
                      </View>
                    )}
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Severity:</Text>
                      <Text style={[
                        styles.eventDetailValue,
                        { color: getSeverityColor(selectedEvent.severity) }
                      ]}>
                        {selectedEvent.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  lockButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sessionCard: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  sessionActiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  sessionInfo: {
    gap: 8,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sessionInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
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
  disabledText: {
    color: '#9CA3AF',
  },
  timeoutSetting: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  timeoutOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timeoutOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  selectedTimeoutOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  timeoutOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTimeoutOptionText: {
    color: '#FFF',
  },
  devicesCard: {
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
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currentDevice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  devicePlatform: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  deviceLastActive: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  deviceLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeDeviceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deviceSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  eventsCard: {
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
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 11,
    color: '#6B7280',
  },
  severityIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 4,
    height: 20,
    borderRadius: 2,
    marginTop: -10,
  },
  eventSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  moreEventsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emergencyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    marginBottom: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  emergencyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  eventModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
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
  pinContent: {
    padding: 20,
    gap: 20,
  },
  pinField: {
    gap: 8,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  pinActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  cancelPinButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  cancelPinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  setupPinButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  setupPinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  eventModalDetails: {
    padding: 20,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  eventDetailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetailType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventDetailDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  eventDetailInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

export default WorkerSecurityScreen;
