import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ListItem: React.FC<any> = (props) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>ListItem</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default ListItem;
