import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../atoms/Input';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
}) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { color: '#D1D5DB', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
});

export default FormField;
