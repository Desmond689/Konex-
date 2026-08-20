import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '../store/userStore';
import AdminMenuScreen from '../features/admin/screens/AdminMenuScreen';
import AdminDashboardScreen from '../features/admin/screens/AdminDashboardScreen';
import AdminUsersScreen from '../features/admin/screens/AdminUsersScreen';
import AdminReportsScreen from '../features/admin/screens/AdminReportsScreen';
import AdminContentScreen from '../features/admin/screens/AdminContentScreen';
import AdminCommunitiesScreen from '../features/admin/screens/AdminCommunitiesScreen';
import AdminSquadsScreen from '../features/admin/screens/AdminSquadsScreen';
import AdminChatReportsScreen from '../features/admin/screens/AdminChatReportsScreen';
import AdminBadgesScreen from '../features/admin/screens/AdminBadgesScreen';
import AdminAnalyticsScreen from '../features/admin/screens/AdminAnalyticsScreen';
import AdminNotificationsScreen from '../features/admin/screens/AdminNotificationsScreen';
import AdminAnnouncementsScreen from '../features/admin/screens/AdminAnnouncementsScreen';
import AdminFeaturedScreen from '../features/admin/screens/AdminFeaturedScreen';
import AdminSupportScreen from '../features/admin/screens/AdminSupportScreen';
import AdminStaffScreen from '../features/admin/screens/AdminStaffScreen';
import AdminAuditScreen from '../features/admin/screens/AdminAuditScreen';
import AdminSecurityScreen from '../features/admin/screens/AdminSecurityScreen';
import AdminSettingsScreen from '../features/admin/screens/AdminSettingsScreen';
import AdminAppealsScreen from '../features/admin/screens/AdminAppealsScreen';

const Stack = createNativeStackNavigator();

function isAdminRole(role?: string | null) {
  const r = (role || '').toLowerCase();
  return r === 'admin' || r === 'super_admin' || r === 'moderator';
}

function AccessDenied() {
  return (
    <View style={styles.denied}>
      <Text style={styles.deniedTitle}>Access denied</Text>
      <Text style={styles.deniedSub}>
        Admin role required (users.role). Enforce the same rule with Supabase RLS.
      </Text>
    </View>
  );
}

export const AdminNavigator: React.FC = () => {
  const profile = useUserStore((s) => s.profile);
  const role = (profile as any)?.role as string | undefined;

  if (!isAdminRole(role)) {
    return <AccessDenied />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#12121A' },
        headerTintColor: '#F9FAFB',
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen name="AdminMenu" component={AdminMenuScreen} options={{ title: 'KONEX Admin' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="AdminContent" component={AdminContentScreen} options={{ title: 'Content' }} />
      <Stack.Screen name="AdminCommunities" component={AdminCommunitiesScreen} options={{ title: 'Games & Communities' }} />
      <Stack.Screen name="AdminSquads" component={AdminSquadsScreen} options={{ title: 'Squads' }} />
      <Stack.Screen name="AdminChatReports" component={AdminChatReportsScreen} options={{ title: 'Chat reports' }} />
      <Stack.Screen name="AdminBadges" component={AdminBadgesScreen} options={{ title: 'Badges' }} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ title: 'Analytics' }} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} options={{ title: 'Announcements' }} />
      <Stack.Screen name="AdminFeatured" component={AdminFeaturedScreen} options={{ title: 'Featured' }} />
      <Stack.Screen name="AdminSupport" component={AdminSupportScreen} options={{ title: 'Support' }} />
      <Stack.Screen name="AdminStaff" component={AdminStaffScreen} options={{ title: 'Staff' }} />
      <Stack.Screen name="AdminAudit" component={AdminAuditScreen} options={{ title: 'Audit logs' }} />
      <Stack.Screen name="AdminSecurity" component={AdminSecurityScreen} options={{ title: 'Security' }} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="AdminAppeals" component={AdminAppealsScreen} options={{ title: 'Appeals' }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  denied: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center', padding: 24 },
  deniedTitle: { color: '#EF4444', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  deniedSub: { color: '#9CA3AF', textAlign: 'center' },
});

export default AdminNavigator;
