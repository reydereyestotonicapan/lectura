import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TodayStackParamList } from './types';
import TodayScreen from '../screens/TodayScreen';
import ReadingsScreen from '../screens/ReadingsScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import { useTheme } from '../theme';

const Stack = createStackNavigator<TodayStackParamList>();

export default function TodayStack() {
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
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: 'Lectura de hoy' }} />
      <Stack.Screen name="ReadingsList" component={ReadingsScreen} options={{ title: 'Lecturas' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Preguntas' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados', headerLeft: () => null }} />
    </Stack.Navigator>
  );
}
