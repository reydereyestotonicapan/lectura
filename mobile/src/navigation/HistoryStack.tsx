import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HistoryScreen from '../screens/HistoryScreen';
import { useTheme } from '../theme';

export type HistoryStackParamList = {
  HistoryList: undefined;
};

const Stack = createStackNavigator<HistoryStackParamList>();

export default function HistoryStack() {
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
      <Stack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'Resultados' }} />
    </Stack.Navigator>
  );
}
