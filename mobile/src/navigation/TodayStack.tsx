import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TodayStackParamList } from './types';
import TodayScreen from '../screens/TodayScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createStackNavigator<TodayStackParamList>();

export default function TodayStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: 'Lectura de hoy' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados', headerLeft: () => null }} />
    </Stack.Navigator>
  );
}
