/**
 * KONEX Main tabs + nested stacks for full feature reachability
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../features/home/screens/HomeScreen';
import ChatNavigator from './ChatNavigator';
import CommunityNavigator from './CommunityNavigator';
import SquadNavigator from './SquadNavigator';
import ProfileNavigator from './ProfileNavigator';
import LFGScreen from '../features/lfg/screens/LFGScreen';
import LFGCreationScreen from '../features/lfg/screens/LFGCreationScreen';
import LFGDetailScreen from '../features/lfg/screens/LFGDetailScreen';
import TournamentScreen from '../features/tournament/screens/TournamentScreen';
import TournamentCreationScreen from '../features/tournament/screens/TournamentCreationScreen';
import TournamentDetailScreen from '../features/tournament/screens/TournamentDetailScreen';
import NotificationScreen from '../features/notification/screens/NotificationScreen';
import SearchScreen from '../features/search/screens/SearchScreen';
import StoryCreateScreen from '../features/stories/screens/StoryCreateScreen';
import StoryViewScreen from '../features/stories/screens/StoryViewScreen';
import AdminNavigator from './AdminNavigator';
import ActiveCallScreen from '../features/calls/screens/ActiveCallScreen';
import IncomingCallScreen from '../features/calls/screens/IncomingCallScreen';
import SquadVoiceScreen from '../features/calls/screens/SquadVoiceScreen';
import { CallIncomingListener } from '../features/calls/CallIncomingListener';

export type MainTabParamList = {
  Home: undefined;
  Communities: undefined;
  Squads: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <View style={styles.iconWrap}>
    <Text style={[styles.iconLabel, focused && styles.iconLabelFocused]}>{label.slice(0, 1)}</Text>
  </View>
);

function MainTabs() {
  return (
    <>
      <CallIncomingListener />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#12121A',
          borderTopColor: '#1E1E2A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }} />
      <Tab.Screen name="Communities" component={CommunityNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Comm" focused={focused} /> }} />
      <Tab.Screen name="Squads" component={SquadNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Squad" focused={focused} /> }} />
      <Tab.Screen name="Chat" component={ChatNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Chat" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Me" focused={focused} /> }} />
    </Tab.Navigator>
    </>
  );
}

/** Root stack so LFG/Tournaments/Stories/Search/Notifications are reachable */
export const MainNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#12121A' }, headerTintColor: '#F9FAFB', contentStyle: { backgroundColor: '#0A0A0F' } }}>
    <RootStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
    <RootStack.Screen name="LFG" component={LFGScreen} options={{ title: 'Looking for Group' }} />
    <RootStack.Screen name="LFGCreate" component={LFGCreationScreen} options={{ title: 'Create LFG' }} />
    <RootStack.Screen name="LFGDetail" component={LFGDetailScreen} options={{ title: 'LFG' }} />
    <RootStack.Screen name="Tournaments" component={TournamentScreen} options={{ title: 'Tournaments' }} />
    <RootStack.Screen name="TournamentCreate" component={TournamentCreationScreen} options={{ title: 'Create Tournament' }} />
    <RootStack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={{ title: 'Tournament' }} />
    <RootStack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    <RootStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    <RootStack.Screen name="StoryCreate" component={StoryCreateScreen} options={{ title: 'New Story' }} />
    <RootStack.Screen name="StoryView" component={StoryViewScreen} options={{ title: 'Story', headerShown: false }} />
    <RootStack.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
    <RootStack.Screen name="ActiveCall" component={ActiveCallScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="SquadVoice" component={SquadVoiceScreen} options={{ title: 'Voice chat' }} />
  </RootStack.Navigator>
);

const styles = StyleSheet.create({
  iconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconLabel: { color: '#6B7280', fontSize: 14, fontWeight: '700' },
  iconLabelFocused: { color: '#7C3AED' },
});

export default MainNavigator;
