import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './types';
import TodayStack from './TodayStack';
import AccountStack from './AccountStack';
import HistoryStack from './HistoryStack';
import { useTheme, createShadows } from '../theme';

const Tab = createBottomTabNavigator<AppTabsParamList>();

interface TabIconProps {
  emoji: string;
  focused: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function TabIcon({ emoji, focused, colors }: TabIconProps) {
  return (
    <View style={[tabStyles.item, focused && { backgroundColor: colors.goldFaint }]}>
      <Text style={[tabStyles.emoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
    </View>
  );
}

export default function AppTabs() {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          ...shadows.md,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tab.Screen
        name="TodayTab"
        component={TodayStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} colors={colors} />,
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 48,
    borderRadius: 16,
  },
  emoji: {
    fontSize: 26,
  },
});
