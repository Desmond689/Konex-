import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) => (
  <View style={[styles.wrap, style]}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      style={styles.input}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E2A',
    paddingHorizontal: 14,
    height: 44,
    justifyContent: 'center',
  },
  input: { color: '#F9FAFB', fontSize: 16 },
});

export default SearchBar;
