import { Stack } from 'expo-router';
import { KeyboardRoot } from '../components/KeyboardRoot';
import { setupWeb } from '../lib/webSetup';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../lib/theme';

setupWeb();

export default function RootLayout() {
  return (
    <KeyboardRoot>
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
    </KeyboardRoot>
  );
}
