import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useReports } from '../context/ReportsContext';
import { AppStackParamList } from '../navigation/AppNavigator';

const MyReportsScreen = () => {
  const { reports } = useReports();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [selectedReport, setSelectedReport] = React.useState<number | null>(null);

  const renderReport = ({ item }: { item: any }) => (
    <View style={styles.reportCard}>
      <TouchableOpacity onPress={() => setSelectedReport(item.id)}>
        <Image
          source={item.photo ? { uri: item.photo } : require('../assets/city-skyline.png')}
          style={styles.reportImage}
        />
      </TouchableOpacity>
      <View style={styles.reportDetails}>
        <Text style={styles.reportType}>{item.type}</Text>
        <Text style={styles.reportDescription}>{item.description}</Text>
        <Text style={styles.reportLocation}>{item.location}</Text>
      </View>
      {selectedReport === item.id && (
        <Button
          title="Navigate to Worker Screen"
          onPress={() => navigation.navigate('WorkerScreen', { reportId: item.id, latitude: item.latitude, longitude: item.longitude })}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReport}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fa', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1976d2', marginBottom: 16 },
  listContainer: { paddingBottom: 24 },
  reportCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 2 },
  reportImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  reportDetails: { flex: 1 },
  reportType: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  reportDescription: { fontSize: 14, color: '#555', marginVertical: 4 },
  reportLocation: { fontSize: 12, color: '#888' },
});

export default MyReportsScreen;
