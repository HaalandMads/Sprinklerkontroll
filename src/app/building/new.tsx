import React from 'react';
import { router, Stack } from 'expo-router';
import { saveBuilding } from '../../lib/db';
import { BuildingForm } from '../../components/BuildingForm';

export default function NewBuilding() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nytt bygg' }} />
      <BuildingForm saveLabel="Lagre bygg" onSave={async (b) => {
        const id = await saveBuilding(b);
        router.replace(`/building/${id}`);
      }} />
    </>
  );
}
