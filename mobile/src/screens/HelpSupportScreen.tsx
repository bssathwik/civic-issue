import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HelpSupportScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Help & Support</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});

export default HelpSupportScreen;
