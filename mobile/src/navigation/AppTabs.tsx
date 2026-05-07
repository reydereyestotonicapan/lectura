import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './types';
import TodayStack from './TodayStack';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const PRIMARY = '#6366f1';

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} options={{ title: 'Hoy' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
