import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RateResolutionScreen = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons 
            name={i <= rating ? "star" : "star-outline"} 
            size={30} 
            color={i <= rating ? "#FFD700" : "#DDD"} 
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate the Resolution</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.questionText}>How was the fix for &quot;Pothole on Oak St.&quot;</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <TouchableOpacity style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Type/Status</Text>
          
          <View style={styles.issueCard}>
            <Image 
              source={require('../assets/city-skyline.png')} 
              style={styles.issueImage} 
            />
            <View style={styles.issueInfo}>
              <Text style={styles.issueTitle}>Pothole on Oak St.</Text>
              <Text style={styles.issueStatus}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.commentLabel}>Optional: Leave a comment...</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Leave a comment..."
            multiline
            value={comment}
            onChangeText={setComment}
            numberOfLines={4}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    padding: 5,
  },
  ratingSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  star: {
    marginHorizontal: 5,
  },
  doneButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  issueCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  issueImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  issueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  issueStatus: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  commentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
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

export default RateResolutionScreen;
