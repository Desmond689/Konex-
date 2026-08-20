import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ModerationHistory: React.FC = () => (
  <View style={styles.wrap}>
    <Text style={styles.text}>Moderation History</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 12 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default ModerationHistory;
