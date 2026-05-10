import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ReadingsStackParamList } from './types';
import ReadingsScreen from '../screens/ReadingsScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createStackNavigator<ReadingsStackParamList>();

export default function ReadingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ReadingsList" 
        component={ReadingsScreen} 
        options={{ title: 'Lecturas' }} 
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen} 
        options={{ title: 'Quiz' }} 
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ title: 'Resultados', headerLeft: () => null }} 
      />
    </Stack.Navigator>
  );
}
