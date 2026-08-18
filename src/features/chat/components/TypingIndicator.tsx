import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TypingIndicator: React.FC<{ name?: string }> = ({ name }) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>{name ? `${name} is typing...` : 'Typing...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 4 },
  text: { color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
});

export default TypingIndicator;
