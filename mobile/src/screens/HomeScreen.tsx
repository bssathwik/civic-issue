import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const user = {
  name: 'Sathwik',
  level: 'Level 5 - Community Hero',
  points: '250M-AQ2G',
  avatar: require('../assets/icon.png'), // Replace with actual user avatar
};

const issues = [
  {
    id: 1,
    title: 'Pothole on Main St.',
    image: require('../assets/city-skyline.png'), // Replace with actual issue image
    status: 'In Progress',
    upvotes: 25,
  },
  {
    id: 2,
    title: 'Overflowing Trash',
    image: require('../assets/city-skyline.png'), // Replace with actual issue image
    status: 'Pending',
    upvotes: 8,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hi, {user.name}!</Text>
          <Text style={styles.level}>{user.level}</Text>
          <Text style={styles.points}>Earned Points: {user.points}</Text>
          <View style={styles.leaderboardRow}>
            <Image source={require('../assets/adaptive-icon.png')} style={styles.badge} />
            <Text style={styles.leaderboard}>Community Leaderboard</Text>
          </View>
        </View>
      </View>

      {/* Map & Report Button */}
      <View style={styles.mapContainer}>
        <Image source={require('../assets/city-skyline.png')} style={styles.mapImage} />
        <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('ReportIssue')}>
          <Image source={require('../assets/icon.png')} style={styles.cameraIcon} />
          <Text style={styles.reportText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Local Activity */}
      <Text style={styles.sectionTitle}>Recent Local Activity</Text>
      {issues.map(issue => (
        <View key={issue.id} style={styles.issueCard}>
          <Image source={issue.image} style={styles.issueImage} />
          <View style={styles.issueInfo}>
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.status, issue.status === 'In Progress' ? styles.inProgress : styles.pending]}>{issue.status}</Text>
              <View style={styles.upvoteBox}>
                <Text style={styles.upvoteText}>Upvote</Text>
                <Text style={styles.upvoteCount}>{issue.upvotes}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  level: {
    fontSize: 14,
    color: '#4caf50',
    marginBottom: 2,
  },
  points: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  badge: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  leaderboard: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
  },
  mapContainer: {
    marginVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    opacity: 0.9,
  },
  reportButton: {
    position: 'absolute',
    top: 36,
    alignSelf: 'center',
    backgroundColor: '#2196f3',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  cameraIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    tintColor: '#fff',
  },
  reportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    color: '#222',
  },
  issueCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    padding: 10,
  },
  issueImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  issueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#fff',
  },
  inProgress: {
    backgroundColor: '#4caf50',
  },
  pending: {
    backgroundColor: '#ff9800',
  },
  upvoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  upvoteText: {
    fontSize: 13,
    color: '#1976d2',
    marginRight: 4,
    fontWeight: '600',
  },
  upvoteCount: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
