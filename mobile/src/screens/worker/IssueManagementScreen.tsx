import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const IssueManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentIssue, setCurrentIssue] = useState({
    id: '1',
    title: 'Large Pothole on Main Street',
    description: 'Deep pothole causing vehicle damage',
    category: 'Road Maintenance',
    status: 'in_progress',
    priority: 'high',
    location: 'Main Street, Block A',
    beforePhotos: [],
    afterPhotos: [],
    workNotes: '',
  });

  const [workNotes, setWorkNotes] = useState('');

  const statusOptions = [
    { key: 'assigned', label: 'Assigned', color: '#FFA500' },
    { key: 'in_progress', label: 'In Progress', color: '#007AFF' },
    { key: 'resolved', label: 'Resolved', color: '#4ECDC4' },
    { key: 'requires_followup', label: 'Requires Follow-up', color: '#FF6B6B' },
  ];

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to "${statusOptions.find(s => s.key === newStatus)?.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            setCurrentIssue(prev => ({ ...prev, status: newStatus }));
            Alert.alert('Status Updated', 'Issue status has been updated successfully.');
          },
        },
      ]
    );
  };

  const handleTakePhoto = (type: 'before' | 'after') => {
    Alert.alert(
      'Add Photo',
      `Take a ${type} photo of the issue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log(`Open camera for ${type} photo`) },
        { text: 'Gallery', onPress: () => console.log(`Open gallery for ${type} photo`) },
      ]
    );
  };

  const handleSaveNotes = () => {
    setCurrentIssue(prev => ({ ...prev, workNotes }));
    Alert.alert('Notes Saved', 'Your work notes have been saved successfully.');
  };

  const getCurrentStatusColor = () => {
    return statusOptions.find(s => s.key === currentIssue.status)?.color || '#666';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Management</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Issue Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Issue Details</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="document-text" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>{currentIssue.title}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{currentIssue.location}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="pricetag" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{currentIssue.category}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="flag" size={20} color="#666" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={[styles.detailValue, { color: '#FF6B6B', fontWeight: 'bold' }]}>
              {currentIssue.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.descriptionText}>{currentIssue.description}</Text>
        </View>
      </View>

      {/* Status Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Management</Text>
        
        <View style={styles.currentStatusContainer}>
          <Text style={styles.currentStatusLabel}>Current Status:</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getCurrentStatusColor() }
            ]}
          >
            <Text style={styles.statusText}>
              {statusOptions.find(s => s.key === currentIssue.status)?.label}
            </Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Update Status</Text>
        <View style={styles.statusGrid}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusButton,
                { backgroundColor: status.color },
                currentIssue.status === status.key && styles.currentStatusButton,
              ]}
              onPress={() => handleStatusUpdate(status.key)}
              disabled={currentIssue.status === status.key}
            >
              <Text style={styles.statusButtonText}>{status.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photo Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        
        <View style={styles.photoSection}>
          <View style={styles.photoSubSection}>
            <Text style={styles.photoSubTitle}>Before Photos</Text>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleTakePhoto('before')}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.photoButtonText}>Take Before Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoSubSection}>
            <Text style={styles.photoSubTitle}>After Photos</Text>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleTakePhoto('after')}
              disabled={currentIssue.status !== 'resolved'}
            >
              <Ionicons
                name="camera"
                size={24}
                color={currentIssue.status === 'resolved' ? '#007AFF' : '#ccc'}
              />
              <Text
                style={[
                  styles.photoButtonText,
                  { color: currentIssue.status === 'resolved' ? '#007AFF' : '#ccc' }
                ]}
              >
                Take After Photo
              </Text>
            </TouchableOpacity>
            {currentIssue.status !== 'resolved' && (
              <Text style={styles.disabledNote}>
                Available when issue is resolved
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Work Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Notes</Text>
        
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          placeholder="Add your work notes, observations, materials used, etc..."
          value={workNotes}
          onChangeText={setWorkNotes}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes}>
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Notes</Text>
        </TouchableOpacity>

        {currentIssue.workNotes && (
          <View style={styles.existingNotes}>
            <Text style={styles.existingNotesTitle}>Previous Notes:</Text>
            <Text style={styles.existingNotesText}>{currentIssue.workNotes}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.mapButton]}
          onPress={() => {
            Alert.alert('Navigate', 'Open navigation to issue location');
          }}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.actionButtonText}>Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => {
            Alert.alert('Contact', 'Contact supervisor or reporter');
          }}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>
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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 5,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentStatusLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  currentStatusButton: {
    opacity: 0.5,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoSection: {
    gap: 20,
  },
  photoSubSection: {
    alignItems: 'center',
  },
  photoSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  disabledNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  existingNotes: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  existingNotesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  existingNotesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  mapButton: {
    backgroundColor: '#4ECDC4',
  },
  contactButton: {
    backgroundColor: '#FFA500',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default IssueManagementScreen;
