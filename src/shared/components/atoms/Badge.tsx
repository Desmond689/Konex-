import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Badge: React.FC<any> = (props) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>Badge</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default Badge;
