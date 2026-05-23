import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { KidsStackParamList } from './types';
import KidsReadingsScreen from '../screens/KidsReadingsScreen';
import KidsReadingDetailScreen from '../screens/KidsReadingDetailScreen';
import { useTheme } from '../theme';

const Stack = createStackNavigator<KidsStackParamList>();

export default function KidsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="KidsReadings" component={KidsReadingsScreen} options={{ title: 'Lecturas Niños' }} />
      <Stack.Screen name="KidsReadingDetail" component={KidsReadingDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}
