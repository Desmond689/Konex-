import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import BadgesScreen from '../features/profile/screens/BadgesScreen';
import FriendsScreen from '../features/profile/screens/FriendsScreen';
import FollowersScreen from '../features/profile/screens/FollowersScreen';
import FollowingScreen from '../features/profile/screens/FollowingScreen';
import AccountSettingsScreen from '../features/profile/screens/AccountSettingsScreen';
import PrivacySettingsScreen from '../features/profile/screens/PrivacySettingsScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Badges: undefined;
  Friends: undefined;
  Followers: undefined;
  Following: undefined;
  AccountSettings: undefined;
  PrivacySettings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#12121A' }, headerTintColor: '#F9FAFB', contentStyle: { backgroundColor: '#0A0A0F' } }}>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges' }} />
    <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
    <Stack.Screen name="Followers" component={FollowersScreen} options={{ title: 'Followers' }} />
    <Stack.Screen name="Following" component={FollowingScreen} options={{ title: 'Following' }} />
    <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Account' }} />
    <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacy' }} />
  </Stack.Navigator>
);

export default ProfileNavigator;
