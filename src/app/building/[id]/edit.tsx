import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Building, getBuilding, saveBuilding } from '../../../lib/db';
import { BuildingForm } from '../../../components/BuildingForm';

export default function EditBuilding() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<Building | null>(null);
  useEffect(() => { getBuilding(id).then(setB); }, [id]);
  if (!b) return <Stack.Screen options={{ title: 'Endre bygg' }} />;
  return (
    <>
      <Stack.Screen options={{ title: 'Endre bygg' }} />
      <BuildingForm initial={b} saveLabel="Lagre endringer" onSave={async (x) => {
        await saveBuilding(x, id);
        router.back();
      }} />
    </>
  );
}
