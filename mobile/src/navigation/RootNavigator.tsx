import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import TodayStack from './TodayStack';

export default function RootNavigator() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) return <AppTabs />;
  if (isGuest) return <TodayStack />;
  return <AuthStack />;
}
