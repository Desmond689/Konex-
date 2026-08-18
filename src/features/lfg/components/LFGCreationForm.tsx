import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FormField from '../../../components/molecules/FormField';
import Button from '../../../components/atoms/Button';

interface Props {
  onSubmit?: (data: { title: string; slots: number; description: string }) => void;
}

export const LFGCreationForm: React.FC<Props> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('4');

  return (
    <View style={styles.form}>
      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Looking for ranked duo" />
      <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Details..." />
      <FormField label="Slots" value={slots} onChangeText={setSlots} placeholder="4" />
      <Button
        title="Post LFG"
        onPress={() => onSubmit?.({ title, description, slots: parseInt(slots, 10) || 4 })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: { padding: 16 },
});

export default LFGCreationForm;
