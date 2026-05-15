import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './types';
import TodayStack from './TodayStack';
import AccountStack from './AccountStack';
import HistoryScreen from '../screens/HistoryScreen';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} options={{ title: 'Hoy' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Resultados' }} />
      <Tab.Screen name="Account" component={AccountStack} options={{ title: 'Cuenta' }} />
    </Tab.Navigator>
  );
}
