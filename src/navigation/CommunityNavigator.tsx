import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../features/community/screens/CommunityScreen';
import CommunityPosts from '../features/community/screens/CommunityPosts';
import CommunityMembers from '../features/community/screens/CommunityMembers';
import CommunitySquads from '../features/community/screens/CommunitySquads';
import CommunityLFG from '../features/community/screens/CommunityLFG';
import CommunityTournaments from '../features/community/screens/CommunityTournaments';

export type CommunityStackParamList = {
  CommunityList: undefined;
  CommunityPosts: { communityId?: string };
  CommunityMembers: { communityId?: string };
  CommunitySquads: { communityId?: string };
  CommunityLFG: { communityId?: string };
  CommunityTournaments: { communityId?: string };
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#12121A' }, headerTintColor: '#F9FAFB', contentStyle: { backgroundColor: '#0A0A0F' } }}>
    <Stack.Screen name="CommunityList" component={CommunityScreen} options={{ title: 'Communities' }} />
    <Stack.Screen name="CommunityPosts" component={CommunityPosts} options={{ title: 'Posts' }} />
    <Stack.Screen name="CommunityMembers" component={CommunityMembers} options={{ title: 'Members' }} />
    <Stack.Screen name="CommunitySquads" component={CommunitySquads} options={{ title: 'Squads' }} />
    <Stack.Screen name="CommunityLFG" component={CommunityLFG} options={{ title: 'LFG' }} />
    <Stack.Screen name="CommunityTournaments" component={CommunityTournaments} options={{ title: 'Tournaments' }} />
  </Stack.Navigator>
);

export default CommunityNavigator;
