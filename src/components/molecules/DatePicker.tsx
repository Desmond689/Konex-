import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

/**
 * Device-friendly date entry. Uses ISO date string (YYYY-MM-DD).
 * For full native spinner, add @react-native-community/datetimepicker when prebuilding.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Date',
}) => {
  const initial =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : typeof value === 'string' && value
        ? value.slice(0, 10)
        : '';
  const [text, setText] = useState(initial);

  const commit = (v: string) => {
    setText(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const d = new Date(v + 'T00:00:00');
      if (!isNaN(d.getTime())) onChange?.(d);
    }
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={commit}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#6B7280"
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: '#D1D5DB', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#12121A',
    borderWidth: 1,
    borderColor: '#1E1E2A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
  },
});

export default DatePicker;
