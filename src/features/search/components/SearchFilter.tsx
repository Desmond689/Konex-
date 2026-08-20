import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const OPTIONS = ['All', 'Users', 'Squads', 'Communities', 'Posts'];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export const SearchFilter: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.row}>
    {OPTIONS.map((o) => (
      <TouchableOpacity key={o} style={[styles.chip, value === o && styles.active]} onPress={() => onChange(o)}>
        <Text style={[styles.text, value === o && styles.textActive]}>{o}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1E1E2A' },
  active: { backgroundColor: '#7C3AED' },
  text: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  textActive: { color: '#fff' },
});

export default SearchFilter;
