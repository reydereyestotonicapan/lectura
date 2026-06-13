import 'react-native-gesture-handler';
import React, { useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { ThemeProvider, useTheme } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { useNotifications } from './src/hooks/useNotifications';

function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Only consider the user "ready for notifications" once the navigation
  // container has mounted and rendered the authenticated screens.
  // This prevents the permission dialog from appearing on the login screen.
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useNotifications(navigationRef, isAuthenticated && isNavigationReady);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsNavigationReady(true)}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
