import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SearchBar: React.FC<any> = (props) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>SearchBar</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  text: { color: '#9CA3AF', fontSize: 14 },
});

export default SearchBar;
