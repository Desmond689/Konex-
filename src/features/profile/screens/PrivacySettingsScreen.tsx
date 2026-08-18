/**
 * KONEX PrivacySettingsScreen
 * Billion Dollar Code - Production Ready
 * 
 * Privacy settings screen
 * 
 * Usage:
 * <PrivacySettingsScreen navigation={navigation} />
 */

import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Switch,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { userService } from '../../../api/services/user.service';
import Card from '../../../components/atoms/Card';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import Dropdown from '../../../components/molecules/Dropdown';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../store/userStore';

// ============================================
// 1. TYPES
// ============================================

export interface PrivacySettingsScreenProps {
  navigation: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user } = useAuth();
  const { profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
    whoCanDM: 'everyone' as 'everyone' | 'friends' | 'friendsAndSquad' | 'noOne',
    whoCanFollow: 'everyone' as 'everyone' | 'friends' | 'noOne',
    whoCanFriendRequest: 'everyone' as 'everyone' | 'mutualFriends',
    showOnlineStatus: true,
    storyPrivacy: 'friends' as 'everyone' | 'friends' | 'squad' | 'custom',
  });

  useEffect(() => {
    if (profile) {
      setSettings({
        profileVisibility: profile.privacy_profile || 'public',
        whoCanDM: profile.privacy_dm || 'everyone',
        whoCanFollow: profile.privacy_follow || 'everyone',
        whoCanFriendRequest: profile.privacy_friend_request || 'everyone',
        showOnlineStatus: profile.privacy_show_online_status !== false,
        storyPrivacy: profile.privacy_story || 'friends',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userService.updateProfile(user?.id || '', {
        privacy_profile: settings.profileVisibility,
        privacy_dm: settings.whoCanDM,
        privacy_follow: settings.whoCanFollow,
        privacy_friend_request: settings.whoCanFriendRequest,
        privacy_show_online_status: settings.showOnlineStatus,
        privacy_story: settings.storyPrivacy,
      });
      Alert.alert('Success', 'Privacy settings updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    padding: 16,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  };

  const switchRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const switchLabelStyle: TextStyle = {
    fontSize: 15,
    color: colors.text,
  };

  const switchDescriptionStyle: TextStyle = {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Privacy Settings"
        showBack
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'check',
            onPress: handleSave,
          },
        ]}
      />

      <ScrollView style={contentStyle} showsVerticalScrollIndicator={false}>
        {/* Profile Visibility */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={sectionTitleStyle}>Profile</Text>
          <Dropdown
            label="Profile Visibility"
            items={[
              { label: 'Public (everyone)', value: 'public' },
              { label: 'Friends Only', value: 'friends' },
              { label: 'Private (only you)', value: 'private' },
            ]}
            selectedValue={settings.profileVisibility}
            onSelect={(value) => setSettings({ ...settings, profileVisibility: value })}
          />
        </Card>

        {/* Direct Messages */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={sectionTitleStyle}>Direct Messages</Text>
          <Dropdown
            label="Who can DM me?"
            items={[
              { label: 'Everyone', value: 'everyone' },
              { label: 'Friends Only', value: 'friends' },
              { label: 'Friends & Squad', value: 'friendsAndSquad' },
              { label: 'No One', value: 'noOne' },
            ]}
            selectedValue={settings.whoCanDM}
            onSelect={(value) => setSettings({ ...settings, whoCanDM: value })}
          />
        </Card>

        {/* Follow & Friend Requests */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={sectionTitleStyle}>Follow & Friends</Text>
          <Dropdown
            label="Who can follow me?"
            items={[
              { label: 'Everyone', value: 'everyone' },
              { label: 'Friends Only', value: 'friends' },
              { label: 'No One', value: 'noOne' },
            ]}
            selectedValue={settings.whoCanFollow}
            onSelect={(value) => setSettings({ ...settings, whoCanFollow: value })}
          />

          <Dropdown
            label="Who can send friend requests?"
            items={[
              { label: 'Everyone', value: 'everyone' },
              { label: 'Mutual Friends', value: 'mutualFriends' },
            ]}
            selectedValue={settings.whoCanFriendRequest}
            onSelect={(value) => setSettings({ ...settings, whoCanFriendRequest: value })}
            containerStyle={{ marginTop: 8 }}
          />
        </Card>

        {/* Online Status & Stories */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={sectionTitleStyle}>Status & Stories</Text>

          <View style={switchRowStyle}>
            <View>
              <Text style={switchLabelStyle}>Show Online Status</Text>
              <Text style={switchDescriptionStyle}>
                Let others see when you're online
              </Text>
            </View>
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(value) => setSettings({ ...settings, showOnlineStatus: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <Dropdown
            label="Story Privacy"
            items={[
              { label: 'Everyone', value: 'everyone' },
              { label: 'Friends Only', value: 'friends' },
              { label: 'Squad Only', value: 'squad' },
              { label: 'Custom', value: 'custom' },
            ]}
            selectedValue={settings.storyPrivacy}
            onSelect={(value) => setSettings({ ...settings, storyPrivacy: value })}
            containerStyle={{ marginTop: 8 }}
          />
        </Card>

        <Button
          title="Save Changes"
          variant="primary"
          onPress={handleSave}
          loading={isSaving}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;