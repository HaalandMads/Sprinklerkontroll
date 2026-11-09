import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { pointByCode } from '../../lib/fg';
import { PointInfo } from '../../components/PointInfo';
import { Empty, Screen } from '../../components/ui';

export default function Info() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const p = pointByCode(code);
  return (
    <Screen>
      <Stack.Screen options={{ title: `Kontrollpunkt ${code}` }} />
      {p ? <PointInfo point={p} /> : <Empty text="Fant ikke kontrollpunktet." />}
    </Screen>
  );
}
