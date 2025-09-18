import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image source={require('../assets/icon.png')} style={styles.avatar} />
          <Text style={styles.name}>Sathwik!</Text>
          <Text style={styles.subtitle}>Level 5 - Community Hero</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.points}>2750/3000 XP</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gamification & Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gamification & Rewards</Text>
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <Text style={styles.rewardText}>Big Member{'\n'}Rewards</Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Ionicons name="trash" size={24} color="#666" />
              </View>
              <Text style={styles.rewardText}>Top Resolver{'\n'}Performance</Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Ionicons name="shield" size={24} color="#666" />
              </View>
              <Text style={styles.rewardText}>Protective</Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Ionicons name="star" size={24} color="#666" />
              </View>
              <Text style={styles.rewardText}>Popular</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.menuText}>My Reports</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={20} color="#666" />
            <Text style={styles.menuText}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.menuText}>Help or Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#4ECDC4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="search" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="add-circle" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubbles" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECDC4',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    paddingBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  points: {
    fontSize: 14,
    color: '#fff',
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    lineHeight: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
});

export default ProfileScreen;
