import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Props {
  name: string;
  memberCount?: number;
  avatarUrl?: string;
  description?: string;
}

export const CommunityHeader: React.FC<Props> = ({ name, memberCount, avatarUrl, description }) => (
  <View style={styles.wrap}>
    {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder} />}
    <Text style={styles.name}>{name}</Text>
    {memberCount != null ? <Text style={styles.meta}>{memberCount} members</Text> : null}
    {description ? <Text style={styles.desc}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', marginBottom: 12 },
  name: { color: '#F9FAFB', fontSize: 22, fontWeight: '700' },
  meta: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
  desc: { color: '#D1D5DB', fontSize: 14, marginTop: 8, textAlign: 'center' },
});

export default CommunityHeader;
