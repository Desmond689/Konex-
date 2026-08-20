import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MainNavigator } from '../../navigation/MainNavigator';
import { AdminNavigator } from '../../navigation/AdminNavigator';

const Drawer = createDrawerNavigator();

export const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: false,
      drawerStyle: { backgroundColor: '#12121A' },
      drawerActiveTintColor: '#7C3AED',
      drawerInactiveTintColor: '#9CA3AF',
    }}
  >
    <Drawer.Screen name="MainTabs" component={MainNavigator} options={{ title: 'Home' }} />
    <Drawer.Screen name="Admin" component={AdminNavigator} options={{ title: 'Admin' }} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
