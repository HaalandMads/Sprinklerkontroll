import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CapacityTest, deleteCapacityTest, getCapacityTest, saveCapacityTest } from '../../lib/db';
import { fmtDate } from '../../lib/format';
import { CapacityForm } from '../../components/CapacityForm';

export default function EditCapacity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [t, setT] = useState<CapacityTest | null>(null);
  useEffect(() => { getCapacityTest(id).then(setT); }, [id]);
  if (!t) return <Stack.Screen options={{ title: 'Kapasitetsmåling' }} />;
  return (
    <>
      <Stack.Screen options={{ title: `Kapasitet ${fmtDate(t.date)}` }} />
      <CapacityForm buildingId={t.building_id} initial={t} saveLabel="Lagre endringer"
        onSave={async (c) => { await saveCapacityTest(c, id); router.back(); }}
        onDelete={() => Alert.alert('Slette målingen?', 'Dette kan ikke angres.', [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Slett', style: 'destructive', onPress: async () => { await deleteCapacityTest(id); router.back(); } },
        ])} />
    </>
  );
}
