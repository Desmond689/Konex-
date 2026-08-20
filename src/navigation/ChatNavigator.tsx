import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../features/chat/screens/ChatListScreen';
import DMScreen from '../features/chat/screens/DMScreen';
import SquadChatScreen from '../features/chat/screens/SquadChatScreen';
import ActiveCallScreen from '../features/calls/screens/ActiveCallScreen';
import IncomingCallScreen from '../features/calls/screens/IncomingCallScreen';
import SquadVoiceScreen from '../features/calls/screens/SquadVoiceScreen';
import CallHistoryScreen from '../features/calls/screens/CallHistoryScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  DM: { conversationId: string; userId?: string };
  SquadChat: { squadId: string };
  ActiveCall: { callId: string; role: 'caller' | 'callee'; remoteUserId?: string; peerName?: string };
  IncomingCall: { callId: string; callerName?: string };
  SquadVoice: { squadId: string; squadName?: string; callId?: string };
  CallHistory: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#12121A' },
      headerTintColor: '#F9FAFB',
      contentStyle: { backgroundColor: '#0A0A0F' },
    }}
  >
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chats' }} />
    <Stack.Screen name="DM" component={DMScreen} options={{ title: 'Message' }} />
    <Stack.Screen name="SquadChat" component={SquadChatScreen} options={{ title: 'Squad Chat' }} />
    <Stack.Screen name="ActiveCall" component={ActiveCallScreen} options={{ title: 'Call', headerShown: false }} />
    <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ title: 'Incoming', headerShown: false }} />
    <Stack.Screen name="SquadVoice" component={SquadVoiceScreen} options={{ title: 'Voice chat' }} />
    <Stack.Screen name="CallHistory" component={CallHistoryScreen} options={{ title: 'Call history' }} />
  </Stack.Navigator>
);

export default ChatNavigator;
