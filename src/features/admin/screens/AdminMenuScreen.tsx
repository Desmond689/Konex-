/**
 * KONEX Admin control center — section index (sidebar equivalent)
 * Access is gated by AdminNavigator role check.
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SECTIONS: { key: string; title: string; route: string; blurb: string }[] = [
  { key: 'dash', title: 'Dashboard', route: 'AdminDashboard', blurb: 'Platform overview & health' },
  { key: 'users', title: 'Users', route: 'AdminUsers', blurb: 'Search, suspend, ban, verify' },
  { key: 'mod', title: 'Reports & Moderation', route: 'AdminReports', blurb: 'Review & act on reports' },
  { key: 'content', title: 'Content', route: 'AdminContent', blurb: 'Posts & visibility control' },
  { key: 'games', title: 'Games & Communities', route: 'AdminCommunities', blurb: 'Games, logos, communities' },
  { key: 'squads', title: 'Squads', route: 'AdminSquads', blurb: 'Squad oversight' },
  { key: 'chat', title: 'Chat reports', route: 'AdminChatReports', blurb: 'Reported messages only' },
  { key: 'badges', title: 'Badges', route: 'AdminBadges', blurb: 'Gamification' },
  { key: 'analytics', title: 'Analytics', route: 'AdminAnalytics', blurb: 'Growth & engagement' },
  { key: 'notif', title: 'Notifications', route: 'AdminNotifications', blurb: 'Push / system sends' },
  { key: 'announce', title: 'Announcements', route: 'AdminAnnouncements', blurb: 'Platform announcements' },
  { key: 'featured', title: 'Featured', route: 'AdminFeatured', blurb: 'Promote content' },
  { key: 'support', title: 'Support', route: 'AdminSupport', blurb: 'Tickets' },
  { key: 'staff', title: 'Staff & Roles', route: 'AdminStaff', blurb: 'Admins & permissions' },
  { key: 'audit', title: 'Audit Logs', route: 'AdminAudit', blurb: 'Admin action history' },
  { key: 'security', title: 'Security', route: 'AdminSecurity', blurb: 'Sessions & alerts' },
  { key: 'settings', title: 'Settings', route: 'AdminSettings', blurb: 'Platform settings' },
];

export default function AdminMenuScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>KONEX ADMIN</Text>
      <Text style={styles.sub}>Control center — actions call Supabase. Failures show real errors.</Text>
      <FlatList
        data={SECTIONS}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate(item.route)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.blurb}>{item.blurb}</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', paddingTop: 12 },
  brand: { color: '#A78BFA', fontSize: 22, fontWeight: '800', paddingHorizontal: 16 },
  sub: { color: '#9CA3AF', fontSize: 12, paddingHorizontal: 16, marginTop: 6, marginBottom: 12 },
  list: { padding: 12, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121A',
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2A',
  },
  title: { color: '#F9FAFB', fontSize: 16, fontWeight: '700' },
  blurb: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  chev: { color: '#6B7280', fontSize: 22, marginLeft: 8 },
});
