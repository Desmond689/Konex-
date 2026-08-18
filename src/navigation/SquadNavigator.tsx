import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SquadListScreen from '../features/squad/screens/SquadListScreen';
import SquadDetailScreen from '../features/squad/screens/SquadDetailScreen';
import SquadCreationScreen from '../features/squad/screens/SquadCreationScreen';
import SquadMembersScreen from '../features/squad/screens/SquadMembersScreen';
import SquadSettingsScreen from '../features/squad/screens/SquadSettingsScreen';
import SquadChatScreen from '../features/chat/screens/SquadChatScreen';
import SquadInviteScreen from '../features/squad/screens/SquadInviteScreen';
import SquadJoinRequestsScreen from '../features/squad/screens/SquadJoinRequestsScreen';

export type SquadStackParamList = {
  SquadList: undefined;
  SquadDetail: { squadId: string };
  SquadCreation: undefined;
  SquadMembers: { squadId: string };
  SquadSettings: { squadId: string };
  SquadChat: { squadId: string };
  SquadInvite: { squadId: string };
  SquadJoinRequests: { squadId: string };
};

const Stack = createNativeStackNavigator<SquadStackParamList>();

export const SquadNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#12121A' }, headerTintColor: '#F9FAFB', contentStyle: { backgroundColor: '#0A0A0F' } }}>
    <Stack.Screen name="SquadList" component={SquadListScreen} options={{ title: 'Squads' }} />
    <Stack.Screen name="SquadDetail" component={SquadDetailScreen} options={{ title: 'Squad' }} />
    <Stack.Screen name="SquadCreation" component={SquadCreationScreen} options={{ title: 'Create Squad' }} />
    <Stack.Screen name="SquadMembers" component={SquadMembersScreen} options={{ title: 'Members' }} />
    <Stack.Screen name="SquadSettings" component={SquadSettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="SquadChat" component={SquadChatScreen} options={{ title: 'Squad Chat' }} />
    <Stack.Screen name="SquadInvite" component={SquadInviteScreen} options={{ title: 'Invite' }} />
    <Stack.Screen name="SquadJoinRequests" component={SquadJoinRequestsScreen} options={{ title: 'Join requests' }} />
  </Stack.Navigator>
);

export default SquadNavigator;
