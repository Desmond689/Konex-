/**
 * KONEX AccountSettingsScreen
 * Billion Dollar Code - Production Ready
 * 
 * Account settings screen
 * 
 * Usage:
 * <AccountSettingsScreen navigation={navigation} />
 */

import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    TextStyle,
    View,
    ViewStyle,
    Text,
} from 'react-native';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Modal from '../../../components/atoms/Modal';
import ListItem from '../../../components/molecules/ListItem';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface AccountSettingsScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user, deleteAccount, signOut } = useAuth();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      setIsDeleteModalVisible(false);
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      navigation.navigate('Auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.navigate('Auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    padding: 16,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const dangerButtonStyle: ViewStyle = {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.error,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Account Settings"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={contentStyle} showsVerticalScrollIndicator={false}>
        <Text style={sectionTitleStyle}>Account</Text>

        <ListItem
          title="Email Address"
          subtitle={user?.email || 'Not set'}
          rightIcon="chevron-right"
          onPress={() => navigation.navigate('ChangeEmail')}
          showDivider
        />

        <ListItem
          title="Change Password"
          subtitle="Update your password"
          rightIcon="chevron-right"
          onPress={() => navigation.navigate('ChangePassword')}
          showDivider
        />

        <Text style={sectionTitleStyle}>Danger Zone</Text>

        <ListItem
          title="Logout"
          subtitle="Sign out of your account"
          leftIcon="log-out"
          onPress={handleLogout}
          showDivider
        />

        <ListItem
          title="Delete Account"
          subtitle="Permanently delete your account and all data"
          leftIcon="trash-2"
          onPress={() => setIsDeleteModalVisible(true)}
          style={{ borderBottomWidth: 0 }}
        />

        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          fullWidth
          style={{ marginTop: 16 }}
        />

        <Button
          title="Delete Account"
          variant="danger"
          onPress={() => setIsDeleteModalVisible(true)}
          fullWidth
          style={dangerButtonStyle}
        />
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Delete Account"
        contentStyle={{ maxWidth: 400 }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
          Are you sure you want to delete your account? This action cannot be undone.
        </Text>

        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
            Type DELETE to confirm
          </Text>
          <Input
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="Type DELETE"
            style={{ marginBottom: 8 }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setIsDeleteModalVisible(false)}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={handleDeleteAccount}
            loading={isDeleting}
            disabled={confirmText !== 'DELETE'}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;