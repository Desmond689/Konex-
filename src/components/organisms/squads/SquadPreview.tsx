import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SquadPreview: React.FC = () => (
  <View style={styles.wrap}>
    <Text style={styles.text}>Squad Preview</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 12 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default SquadPreview;
