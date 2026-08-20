import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ViewStyle,
} from 'react-native';

export interface DropdownItem<T = string | number> {
  label: string;
  value: T;
}

export interface DropdownProps<T = string | number> {
  items?: DropdownItem<T>[];
  selectedValue?: T | null;
  onSelect?: (value: T) => void;
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  placeholder?: string;
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function Dropdown<T extends string | number = string | number>({
  items, selectedValue, onSelect, label, error, containerStyle,
  placeholder = 'Select', options, value, onChange,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const list: DropdownItem<T>[] =
    items ||
    ((options || []).map((o) => ({ label: o.label, value: o.value as T })) as DropdownItem<T>[]);
  const current =
    selectedValue !== undefined && selectedValue !== null
      ? selectedValue
      : (value as T | undefined);
  const selected = list.find((o) => o.value === current);
  const handleSelect = (val: T) => {
    onSelect?.(val);
    if (typeof val === 'string' && onChange) onChange(val);
    setOpen(false);
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{selected?.label || placeholder}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <FlatList
              data={list}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item.value)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: { color: '#9CA3AF', fontSize: 13, marginBottom: 6, fontWeight: '500' },
  trigger: {
    backgroundColor: '#12121A', borderRadius: 10, borderWidth: 1, borderColor: '#1E1E2A',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  triggerText: { color: '#F9FAFB', fontSize: 16 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  menu: { backgroundColor: '#12121A', borderRadius: 12, maxHeight: 280, borderWidth: 1, borderColor: '#1E1E2A' },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E2A' },
  optionText: { color: '#F9FAFB', fontSize: 16 },
});

export default Dropdown;
