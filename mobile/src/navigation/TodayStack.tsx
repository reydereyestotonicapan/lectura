import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { TodayStackParamList } from './types';
import { Colors } from '../theme';
import TodayScreen from '../screens/TodayScreen';
import ReadingsScreen from '../screens/ReadingsScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createStackNavigator<TodayStackParamList>();

export default function TodayStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={({ navigation }) => ({
          title: 'Lectura de hoy',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')} style={{ marginRight: 16 }}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Lecturas</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="ReadingsList" component={ReadingsScreen} options={{ title: 'Lecturas' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultados', headerLeft: () => null }} />
    </Stack.Navigator>
  );
}
