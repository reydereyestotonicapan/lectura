import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HistoryScreen from '../screens/HistoryScreen';
import { Colors } from '../theme';

export type HistoryStackParamList = {
  HistoryList: undefined;
};

const Stack = createStackNavigator<HistoryStackParamList>();

export default function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
        headerStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'Resultados' }} />
    </Stack.Navigator>
  );
}
