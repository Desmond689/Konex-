import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSquadStore } from '../../../store/squadStore';
import { useAuthStore } from '../../../store/authStore';
import { squadService } from '../../../api/services/squad.service';
import { slugify } from '../../../utils/slugify';

function mapSquad(row: any) {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag || row.slug?.slice(0, 6)?.toUpperCase(),
    description: row.description || undefined,
    ownerId: row.leader || row.created_by,
    memberCount: Array.isArray(row.members) ? row.members.length : 1,
    avatarUrl: row.logo || undefined,
    isPublic: row.type !== 'private',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export default function SquadCreationScreen() {
  const navigation = useNavigation<any>();
  const addSquad = useSquadStore((s) => s.addSquad);
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Name required', 'Squad name must be at least 2 characters.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Sign in required', 'Log in to create a squad.');
      return;
    }
    setSubmitting(true);
    try {
      const slug = slugify(name.trim()) || `squad-${Date.now()}`;
      const created = await squadService.createSquad({
        name: name.trim(),
        slug,
        description: description.trim() || null,
        type: isPublic ? 'public' : 'private',
        game: 'general',
        game_mode: 'any',
        skill_level: 'any',
        leader: user.id,
        created_by: user.id,
        requirements: {},
      } as any);
      const mapped = mapSquad(created);
      if (tag.trim()) mapped.tag = tag.trim();
      addSquad(mapped);
      navigation.replace('SquadDetail', { squadId: mapped.id });
    } catch (e: any) {
      Alert.alert(
        'Could not create squad',
        e?.userMessage || e?.message || 'Server rejected the request. Check Supabase schema and RLS.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create Squad</Text>
        <Text style={styles.hint}>Saves to Supabase only. No local fake squads.</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Night Owls" placeholderTextColor="#6B7280" maxLength={40} />
        <Text style={styles.label}>Tag (optional)</Text>
        <TextInput style={styles.input} value={tag} onChangeText={setTag} placeholder="OWL" placeholderTextColor="#6B7280" maxLength={6} autoCapitalize="characters" />
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Who you are..." placeholderTextColor="#6B7280" multiline maxLength={500} />
        <View style={styles.row}>
          <Text style={styles.labelInline}>Public squad</Text>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: '#334155', true: '#7C3AED' }} thumbColor="#F9FAFB" />
        </View>
        <TouchableOpacity style={[styles.submit, submitting && styles.submitDisabled]} onPress={handleCreate} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Creating...' : 'Create squad'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 16 },
  heading: { color: '#F9FAFB', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  hint: { color: '#9CA3AF', fontSize: 12, marginBottom: 16 },
  label: { color: '#D1D5DB', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  labelInline: { color: '#D1D5DB', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#12121A', borderWidth: 1, borderColor: '#1E1E2A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#F9FAFB', fontSize: 16, marginBottom: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  submit: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
