import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Tilbake',
          contentStyle: { backgroundColor: colors.surface },
        }}
      />
    </KeyboardProvider>
  );
}
