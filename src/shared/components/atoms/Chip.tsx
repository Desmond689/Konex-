import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Chip: React.FC<any> = (props) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>Chip</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default Chip;
