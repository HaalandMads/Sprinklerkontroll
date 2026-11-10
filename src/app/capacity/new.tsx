import React from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { saveCapacityTest } from '../../lib/db';
import { CapacityForm } from '../../components/CapacityForm';

export default function NewCapacity() {
  const { buildingId } = useLocalSearchParams<{ buildingId: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Ny kapasitetsmåling' }} />
      <CapacityForm buildingId={buildingId} saveLabel="Lagre måling" onSave={async (c) => { await saveCapacityTest(c); router.back(); }} />
    </>
  );
}
