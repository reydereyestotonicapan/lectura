import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTabsParamList } from './types';
import TodayStack from './TodayStack';
import AccountStack from './AccountStack';
import HistoryStack from './HistoryStack';
import KidsStack from './KidsStack';
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
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'android' ? 64 + insets.bottom : 64,
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
          paddingTop: 0,
          ...shadows.md,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
      safeAreaInsets={Platform.OS === 'android' ? { bottom: 0 } : undefined}
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
        name="KidsTab"
        component={KidsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👶" focused={focused} colors={colors} />,
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
