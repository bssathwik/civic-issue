import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NotificationsScreen = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      title: 'Your issue "Pothole St." has been RESOLVED!',
      subtitle: 'Rate us',
      time: 'Resolved Hrs',
    },
    {
      id: 2,
      type: 'like',
      icon: 'thumbs-up',
      iconColor: '#2196F3',
      title: 'Your comment on the 10 km receives!',
      subtitle: '',
      time: 'Received Hrs',
    },
    {
      id: 3,
      type: 'email',
      icon: 'mail',
      iconColor: '#FF9800',
      title: 'Your Staffer Ben sent: "Broken Pothole" received days',
      subtitle: '',
      time: '',
    },
    {
      id: 4,
      type: 'email',
      icon: 'mail',
      iconColor: '#FF9800',
      title: 'Staffer Ben on update on "Pot ontne closed expected days"',
      subtitle: '',
      time: '',
    },
    {
      id: 5,
      type: 'achievement',
      icon: 'trophy',
      iconColor: '#FFD700',
      title: '"Community Builder badge!"',
      subtitle: '',
      time: '',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {notifications.map((notification) => (
          <TouchableOpacity key={notification.id} style={styles.notificationItem}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={notification.icon as any} 
                size={24} 
                color={notification.iconColor} 
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              {notification.subtitle ? (
                <Text style={styles.notificationSubtitle}>{notification.subtitle}</Text>
              ) : null}
              {notification.time ? (
                <Text style={styles.notificationTime}>{notification.time}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
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
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
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

export default NotificationsScreen;
